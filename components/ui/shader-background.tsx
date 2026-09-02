"use client"

// ShaderBackground — achromatic "audio waves" for Kairo.
// One WebGL canvas that fills its parent. Stacked oscilloscope ribbons in
// silver on near-black, softly warped, with vignette and grain. No deps.
//
// <div className="relative"><ShaderBackground className="absolute inset-0" />…</div>

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const VERT = `attribute vec2 a_position;
void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }`

const FRAG = `precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec4 u_wave;   // seed, amplitude, line count, glow
uniform vec4 u_look;   // brightness, vignette, grain, spread

float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; } return v; }

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;   // y in -0.5..0.5, x aspect-corrected
  float t = u_time;
  float seed = u_wave.x, amp = u_wave.y, lines = u_wave.z, glow = u_wave.w;

  // Waves live in a horizontal band and die out toward the sides, like a scope trace.
  float env = exp(-p.x * p.x * 1.6);
  float col = 0.0;
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    if (fi >= lines) break;
    float ph = seed + fi * 1.73;
    float base = (fi - (lines - 1.0) * 0.5) * u_look.w;
    float a = amp * (0.55 + 0.45 * sin(ph * 2.1)) * env;
    float m = 0.4 + 0.6 * fbm(vec2(p.x * 1.4 + t * 0.15, fi * 3.1 + seed));
    float y = base
      + a * m * sin(p.x * 3.1 + t * (0.55 + 0.08 * fi) + ph)
      + a * 0.35 * sin(p.x * 7.3 - t * (0.9 + 0.05 * fi) + ph * 2.0)
      + a * 0.12 * sin(p.x * 15.0 + t * 1.7 + ph);
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
    const gl = canvas.getContext("webgl", { antialias: false })
    if (!gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(program)
    gl.useProgram(program)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    )
    const loc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, "u_res")
    const uTime = gl.getUniformLocation(program, "u_time")
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

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const animated = speed > 0 && !reduced
    let raf = 0
    let active = true
    let disposed = false
    const start = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width: w, height: h } = canvas.getBoundingClientRect()
      // ponytail: cap at ~2M pixels; the ribbons are soft, nobody sees the difference.
      const scale = Math.min(
        1,
        Math.sqrt(2_000_000 / Math.max(1, w * h * dpr * dpr))
      )
      const width = Math.max(1, Math.round(w * dpr * scale))
      const height = Math.max(1, Math.round(h * dpr * scale))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }

    const render = (now: number) => {
      raf = 0
      if (disposed || !active) return
      resize()
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, ((now - start) / 1000) * speed)
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

    const ro = new ResizeObserver(request)
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
      gl.deleteBuffer(buf)
      gl.deleteProgram(program)
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
