"use client"

// ShaderBackground — achromatic "audio waves" for Kairo.
// One WebGL canvas that fills its parent. Stacked oscilloscope ribbons in
// silver on near-black, softly warped, with vignette and grain. No deps.
//
// Two passes per frame: the ribbon heights depend only on x and time, so a
// tiny (width × 8) pass computes them once per column into a texture, and the
// full-screen pass just reads them back. Same picture, ~10× less GPU work.
//
// <div className="relative"><ShaderBackground className="absolute inset-0" />…</div>

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const VERT = `attribute vec2 a_position;
void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }`

const COMMON = `precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec4 u_wave;   // seed, amplitude, line count, glow
uniform vec4 u_look;   // brightness, vignette, grain, spread

float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
`

// Pass 1: one texel per (column, ribbon). Height packed as 16 bits in RG.
const LUT_FRAG = `${COMMON}
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; } return v; }

void main(){
  float px = (gl_FragCoord.x - 0.5 * u_res.x) / u_res.y;   // x aspect-corrected
  float fi = floor(gl_FragCoord.y);
  float t = u_time;
  float seed = u_wave.x, amp = u_wave.y, lines = u_wave.z;

  // Waves live in a horizontal band and die out toward the sides, like a scope trace.
  float env = exp(-px * px * 1.6);
  float ph = seed + fi * 1.73;
  float base = (fi - (lines - 1.0) * 0.5) * u_look.w;
  float a = amp * (0.55 + 0.45 * sin(ph * 2.1)) * env;
  float m = 0.4 + 0.6 * fbm(vec2(px * 1.4 + t * 0.15, fi * 3.1 + seed));
  float y = base
    + a * m * sin(px * 3.1 + t * (0.55 + 0.08 * fi) + ph)
    + a * 0.35 * sin(px * 7.3 - t * (0.9 + 0.05 * fi) + ph * 2.0)
    + a * 0.12 * sin(px * 15.0 + t * 1.7 + ph);

  float v = floor(clamp(y * 0.5 + 0.5, 0.0, 1.0) * 65535.0 + 0.5);
  float hi = floor(v / 256.0);
  gl_FragColor = vec4(hi / 255.0, (v - hi * 256.0) / 255.0, 0.0, 1.0);
}`

// Pass 2: full screen, reads ribbon heights from the LUT.
const FRAG = `${COMMON}
uniform sampler2D u_lut;

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;   // y in -0.5..0.5, x aspect-corrected
  float seed = u_wave.x, lines = u_wave.z, glow = u_wave.w;

  float env = exp(-p.x * p.x * 1.6);
  float col = 0.0;
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    if (fi >= lines) break;
    vec2 rg = texture2D(u_lut, vec2(uv.x, (fi + 0.5) / 8.0)).rg;
    float y = dot(rg, vec2(255.0 * 256.0, 255.0)) / 65535.0 * 2.0 - 1.0;
    float d = abs(p.y - y);
    col += glow * 0.07 * exp(-d * d * 700.0);   // soft ribbon, no hard core
    col += glow * 0.035 * exp(-d * d * 90.0);   // wide haze around it
  }
  col *= 0.35 + 0.65 * env;
  col += 0.05 * exp(-dot(p, p) * 5.0);             // ambient lamp in the middle

  col *= u_look.x;
  float vd = length(uv - 0.5) * 1.41421356;
  col *= 1.0 - u_look.y * smoothstep(0.3, 1.0, vd);
  col += (hash(gl_FragCoord.xy + seed * 17.0) - 0.5) * u_look.z;

  // Silver, never white: clamp under the app's primary (#c5c5c5).
  vec3 rgb = vec3(clamp(col, 0.0, 0.78));
  gl_FragColor = vec4(rgb, 1.0);
}`

const LUT_ROWS = 8

export type ShaderBackgroundProps = {
  className?: string
  /** Changes the wave phases. Different sections should use different seeds. */
  seed?: number
  /** Wave height, 0–1. */
  amplitude?: number
  /** Number of ribbons, 1–8. */
  lines?: number
  /** Vertical distance between ribbons. */
  spread?: number
  /** Glow width. */
  glow?: number
  brightness?: number
  vignette?: number
  grain?: number
  /** Time multiplier. 0 renders one still frame. */
  speed?: number
}

export function ShaderBackground({
  className,
  seed = 7,
  amplitude = 0.16,
  lines = 5,
  spread = 0.045,
  glow = 1,
  brightness = 1,
  vignette = 0.75,
  grain = 0.05,
  speed = 0.5,
}: ShaderBackgroundProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false })
    if (!gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const vert = compile(gl.VERTEX_SHADER, VERT)
    const link = (frag: string) => {
      const program = gl.createProgram()!
      gl.attachShader(program, vert)
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, frag))
      gl.bindAttribLocation(program, 0, "a_position")
      gl.linkProgram(program)
      gl.useProgram(program)
      gl.uniform4f(
        gl.getUniformLocation(program, "u_wave"),
        seed,
        amplitude,
        lines,
        glow
      )
      gl.uniform4f(
        gl.getUniformLocation(program, "u_look"),
        brightness,
        vignette,
        grain,
        spread
      )
      return {
        program,
        uRes: gl.getUniformLocation(program, "u_res"),
        uTime: gl.getUniformLocation(program, "u_time"),
      }
    }
    const lut = link(LUT_FRAG)
    const main = link(FRAG)
    gl.uniform1i(gl.getUniformLocation(main.program, "u_lut"), 0)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    )
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    const fb = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0
    )
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const animated = speed > 0 && !reduced
    let raf = 0
    let active = true
    let disposed = false
    let quality = 1 // extra downscale when the GPU can't keep up
    let slow = 0
    let last = 0
    let box = { width: 0, height: 0 }
    const start = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width: w, height: h } = box
      // ponytail: cap at ~2M pixels; the ribbons are soft, nobody sees the difference.
      const scale =
        Math.min(1, Math.sqrt(2_000_000 / Math.max(1, w * h * dpr * dpr))) *
        quality
      const width = Math.max(1, Math.round(w * dpr * scale))
      const height = Math.max(1, Math.round(h * dpr * scale))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          width,
          LUT_ROWS,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null
        )
      }
    }

    const render = (now: number) => {
      raf = 0
      if (disposed || !active) return
      // ponytail: degrade only, never climbs back; avoids visible oscillation.
      // 6 consecutive frames over 20ms (ignoring tab-switch gaps) = halve the work.
      const dt = now - last
      last = now
      if (dt > 20 && dt < 200 && ++slow >= 6 && quality > 0.35) {
        quality /= 1.4
        slow = 0
        resize()
      } else if (dt <= 20) slow = 0

      const t = ((now - start) / 1000) * speed
      const { width, height } = canvas

      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.viewport(0, 0, width, LUT_ROWS)
      gl.useProgram(lut.program)
      gl.uniform2f(lut.uRes, width, height)
      gl.uniform1f(lut.uTime, t)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, width, height)
      gl.useProgram(main.program)
      gl.uniform2f(main.uRes, width, height)
      gl.uniform1f(main.uTime, t)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      if (animated) raf = requestAnimationFrame(render)
    }
    const request = () => {
      if (!disposed && active && raf === 0) raf = requestAnimationFrame(render)
    }
    const pause = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    // One synchronous measure at mount; ResizeObserver keeps it current after.
    box = canvas.getBoundingClientRect()
    resize()
    const ro = new ResizeObserver(([e]) => {
      box = e.contentRect
      resize()
      request()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      active =
        (e?.isIntersecting ?? true) && document.visibilityState === "visible"
      if (active) request()
      else pause()
    })
    io.observe(canvas)
    const onVis = () => {
      active = document.visibilityState === "visible"
      if (active) request()
      else pause()
    }
    document.addEventListener("visibilitychange", onVis)
    request()

    return () => {
      disposed = true
      pause()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      gl.deleteFramebuffer(fb)
      gl.deleteTexture(tex)
      gl.deleteBuffer(buf)
      gl.deleteProgram(lut.program)
      gl.deleteProgram(main.program)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [seed, amplitude, lines, spread, glow, brightness, vignette, grain, speed])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("block h-full w-full", className)}
    />
  )
}
