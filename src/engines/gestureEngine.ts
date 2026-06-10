export default class GestureEngine {
  detect(hands: any[]) {
    if (hands.length === 0) return null
    const h = hands[0]
    const lm = h.landmarks
    const dist = (i: number, j: number) => {
      const a = lm[i]
      const b = lm[j]
      return Math.hypot(a.x - b.x, a.y - b.y)
    }

    const wrist = 0
    const palmCenter = 9
    const palmSize = Math.max(dist(wrist, palmCenter), 0.08)
    const tipIndices = [4, 8, 12, 16, 20]
    const isExtended = (tip: number, pip: number, mcp: number) => {
      return dist(tip, pip) > palmSize * 0.55 && dist(pip, mcp) > palmSize * 0.25
    }
    const isFolded = (tip: number, pip: number) => {
      return dist(tip, pip) < palmSize * 0.35
    }
    const tipDistanceToWrist = (tip: number) => dist(tip, wrist)
    const avgTipWrist = tipIndices.reduce((sum, t) => sum + tipDistanceToWrist(t), 0) / tipIndices.length

    // Pinch: thumb and index tips close while index is extended enough
    if (dist(4, 8) < palmSize * 0.28 && isExtended(8, 7, 5)) return 'Pinch'

    // Fist: all tips are folded close to the palm
    const allFolded = [4, 8, 12, 16, 20].every((tip, idx) => {
      const pip = [3, 7, 11, 15, 19][idx]
      return isFolded(tip, pip)
    })
    if (allFolded && avgTipWrist < palmSize * 0.45) return 'Fist'

    // Open palm: all fingers extended and tips far from the wrist
    const allExtended = [
      [4, 3, 2],
      [8, 7, 5],
      [12, 11, 9],
      [16, 15, 13],
      [20, 19, 17]
    ].every(([tip, pip, mcp]) => isExtended(tip, pip, mcp))
    if (allExtended && avgTipWrist > palmSize * 0.85) return 'Open Palm'

    // Peace: index and middle extended while ring and pinky are folded
    const indexExtended = isExtended(8, 7, 5)
    const middleExtended = isExtended(12, 11, 9)
    const ringFolded = isFolded(16, 15)
    const pinkyFolded = isFolded(20, 19)
    if (indexExtended && middleExtended && ringFolded && pinkyFolded) return 'Peace'

    // Thumbs up: thumb extended upward while other fingers are folded
    const thumbUp = dist(4, 2) > palmSize * 0.65 && lm[4].y < lm[3].y && lm[4].y < lm[2].y
    const otherFingersFolded = [8, 12, 16, 20].every((tip) => tipDistanceToWrist(tip) < palmSize * 0.55)
    if (thumbUp && otherFingersFolded) return 'Thumbs Up'

    return null
  }
}
