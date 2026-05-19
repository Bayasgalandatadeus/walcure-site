export default function Background({ o3 = false }) {
  return (
    <>
      <div className="bg-grid" />
      <div className="orb o1" />
      <div className="orb o2" />
      {o3 && <div className="orb o3" />}
    </>
  )
}
