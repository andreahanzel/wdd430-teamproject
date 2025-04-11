import Hero from "../components/Hero";
import FeaturedProducts from "../components/FeaturedProducts";

export default function Homepage() {
  return (
    <>
      <Hero />
      <div id="main-content">
        <FeaturedProducts />
      </div>
    </>
  );
}
