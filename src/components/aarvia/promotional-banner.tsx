import { Link } from "react-router-dom"

export function PromotionalBanner() {
  return (
    <section className="relative w-full h-[300px] overflow-hidden">
      <Link to="/shop" className="block w-full h-full relative group">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-[1.02]"
          style={{ backgroundImage: "url('/images/botanical_banner.png')" }} 
        />
      </Link>
    </section>
  )
}
