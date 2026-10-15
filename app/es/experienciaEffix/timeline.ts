export const scenes = [
  { start: 0, end: 9, motionDuration: 5, visual: 0, team: "groovy", label: "Propuesta", owner: "Groovy · descubrimiento", title: "Una gran marca empieza con una idea clara", text: "Definimos qué ofreces, a quién ayudas y qué te hace diferente" },
  { start: 9, end: 19, motionDuration: 6, visual: "branding", team: "groovy", label: "Branding", owner: "Groovy · identidad de marca", title: "Tu idea encuentra su propia identidad", text: "Nombre, identidad visual y voz: una marca que se reconoce y se recuerda" },
  { start: 19, end: 30, motionDuration: 7, visual: "strategy", team: "groovy", label: "Estrategia", owner: "Groovy · estrategia digital", title: "Cada acción tiene un objetivo", text: "Conectamos audiencia, mensaje y canales. Medimos para ajustar la estrategia" },
  { start: 30, end: 40, motionDuration: 6, visual: 1, team: "groovy", label: "Producción", owner: "Groovy · contenido", title: "Tu marca cobra vida en cada formato", text: "Reels, feed social y merchandising: una misma identidad, muchas posibilidades" },
  { start: 40, end: 49, motionDuration: 5, visual: 2, team: "groovy", label: "Difusión", owner: "Groovy · presencia digital", title: "La estrategia lleva personas hacia tu marca", text: "Contenido y campañas dirigen el interés hacia un lugar donde dar el siguiente paso" },
  { start: 49, end: 60, motionDuration: 7, visual: 3, team: "botpager", label: "Web + IA", owner: "Aquí entra BotPager · web + IA", title: "El interés llega. BotPager lo recibe", text: "Una web con tu identidad y un agente que atiende con la información de tu negocio" },
  { start: 60, end: 71, motionDuration: 7, visual: 4, team: "botpager", label: "Atención", owner: "BotPager · atención y seguimiento", title: "Cada consulta tiene un siguiente paso", text: "Atención, datos del interesado y seguimiento en un mismo recorrido" },
  { start: 71, end: 81, motionDuration: 6, visual: 5, team: "botpager", label: "CRM", owner: "BotPager + tu equipo comercial", title: "Tu equipo ve la oportunidad y avanza hacia el cierre", text: "El CRM organiza el seguimiento. Tu equipo conversa y confirma la venta" },
  { start: 81, end: 96, motionDuration: 10, visual: "growth", team: "joint", label: "Crecimiento", owner: "Groovy + BotPager + tu equipo", title: "De una idea a una marca preparada para crecer", text: "Identidad, estrategia y seguimiento conectados. Así podemos medir su evolución" },
] as const;
export const totalDuration = scenes[scenes.length - 1].end;
export function phaseAt(time: number) { const index = scenes.findIndex(scene => time < scene.end); return index < 0 ? scenes.length - 1 : index; }
export function clamp(value: number) { return Math.max(0, Math.min(1, value)); }

// The supplied recording introduces the website at 00:45. Keep that cue fixed,
// interpolating the other scenes on either side without changing playback speed.
const webStart = scenes.find(scene => scene.label === "Web + IA")!.start;
export function timelineToAudio(time: number, duration: number, calibrated = true) {
  const value = Math.max(0, Math.min(totalDuration, time));
  if (!calibrated || duration <= 45) return value / totalDuration * duration;
  return value <= webStart ? value / webStart * 45 : 45 + (value - webStart) / (totalDuration - webStart) * (duration - 45);
}
export function audioToTimeline(time: number, duration: number, calibrated = true) {
  if (duration <= 0) return 0;
  const value = Math.max(0, Math.min(duration, time));
  if (!calibrated || duration <= 45) return value / duration * totalDuration;
  return value <= 45 ? value / 45 * webStart : webStart + (value - 45) / (duration - 45) * (totalDuration - webStart);
}
