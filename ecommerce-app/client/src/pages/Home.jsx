


// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ProductCard from '../components/ProductCard';
// import Loader from '../components/Loader';
// import './Home.css';
// import modelImg from "../assets/b26fea69ccfd8aa5825862cdb9604a4fb4930464.jpg";

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// const Home = () => {
//   const [loading, setLoading] = useState(false);
//   const [newArrivals, setNewArrivals] = useState([]);
//   const [topSelling, setTopSelling] = useState([]);
//   const navigate = useNavigate();

//   // Fetch products from API
//   useEffect(() => {
//     fetchHomePageProducts();
//   }, []);

//   const fetchHomePageProducts = async () => {
//     setLoading(true);
//     try {
//       // Fetch new arrivals from API
//       const newArrivalsResponse = await fetch(`${API_URL}/products/new-arrivals`);
//       const newArrivalsData = await newArrivalsResponse.json();
      
//       // Fetch on sale products (top selling) from API
//       const topSellingResponse = await fetch(`${API_URL}/products/on-sale`);
//       const topSellingData = await topSellingResponse.json();
      
//       // Handle response format (array or object with products property)
//       const newArrivalsList = Array.isArray(newArrivalsData) 
//         ? newArrivalsData 
//         : (newArrivalsData.products || []);
      
//       const topSellingList = Array.isArray(topSellingData) 
//         ? topSellingData 
//         : (topSellingData.products || []);
      
//       setNewArrivals(newArrivalsList.slice(0, 4));
//       setTopSelling(topSellingList.slice(0, 4));
      
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       // Fallback to mock data if API fails
//       setNewArrivals(mockNewArrivals);
//       setTopSelling(mockTopSelling);
//     } finally {
//       setLoading(false);
//     }
//   };


 

//   // Function to navigate to dress style page
//   const handleDressStyleClick = (style) => {
//     navigate(`/category/${style.toLowerCase()}`);
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="home">
//       {/* Hero Section */}
//       <section className="hero">
//         <div className="container">
//           <div className="hero-wrapper">
//             <div className="hero-content">
//               <h1>FIND CLOTHES THAT MATCHES YOUR STYLE</h1>
//               <p>Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.</p>
//               <button className="btn-primary" onClick={() => navigate('/products')}>
//                 Shop Now <span>→</span>
//               </button>
              
//               <div className="stats">
//                 <div className="stat">
//                   <h3>200+</h3>
//                   <p>International Brands</p>
//                 </div>
//                 <div className="stat">
//                   <h3>2,000+</h3>
//                   <p>High-Quality Products</p>
//                 </div>
//                 <div className="stat">
//                   <h3>30,000+</h3>
//                   <p>Happy Customers</p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="hero-image">
//               <img src={modelImg} alt="Fashion Model" />
//             </div>
//           </div>
//         </div>
//       </section>
      
//       {/* Brands Section */}
//       <section className="brands">
//         <div className="container">
//           <div className="brand-logos">
//             <span>VERSACE</span>
//             <span>ZARA</span>
//             <span>GUCCI</span>
//             <span>PRADA</span>
//             <span>Calvin Klein</span>
//           </div>
//         </div>
//       </section>

//       {/* New Arrivals - Fetched from API */}
//       {newArrivals.length > 0 && (
//         <section className="products-section">
//           <div className="container">
//             <h2 className="section-title">NEW ARRIVALS</h2>
//             <div className="product-grid">
//               {newArrivals.slice(0,3).map(product => (
//                 <ProductCard key={product.id} product={product} />
//               ))}
//             </div>
//             <div className="view-all">
//               <button 
//                 className="btn-secondary" 
//                 onClick={() => navigate('/products?filter=new')}
//               >
//                 View All
//               </button>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Top Selling - Fetched from API */}
//       {topSelling.length > 0 && (
//         <section className="products-section">
//           <div className="container">
//             <h2 className="section-title">TOP SELLING</h2>
//             <div className="product-grid">
//               {topSelling.slice(0,3).map(product => (
//                 <ProductCard key={product.id} product={product} />
//               ))}
//             </div>
//             <div className="view-all">
//               <button className="btn-secondary" onClick={() => navigate('/products?filter=sale')}>
//                 View All
//               </button>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Dress Style Section */}
//       <section className="dress-style">
//         <div className="container">
//           <h2 className="section-title">BROWSE BY DRESS STYLE</h2>
//           <div className="style-grid">
//             <div 
//               className="style-card casual"
//               onClick={() => handleDressStyleClick('Casual')}
//               style={{ cursor: 'pointer' }}
//             >
//               <img 
//                 src="https://assets.vogue.com/photos/67db1d379b250aa9279caf73/master/w_2560%2Cc_limit/Holding%2520Collage%2520(2).jpg"
//                 alt="Casual"
//                 className="style-img"
//               />
//               <span>Casual</span>
//             </div>
//             <div 
//               className="style-card gym"
//               onClick={() => handleDressStyleClick('Gym')}
//               style={{ cursor: 'pointer' }}
//             >
//               <img 
//                 src="https://m.media-amazon.com/images/I/71hU6vBZwfL._AC_UY1100_.jpg"
//                 alt="Gym"
//                 className="style-img"
//               />
//               <span>Gym</span>
//             </div>
//             <div 
//               className="style-card formal"
//               onClick={() => handleDressStyleClick('Formal')}
//               style={{ cursor: 'pointer' }}
//             >
//               <img 
//                 src="https://styl-inc.com/wp-content/uploads/2021/01/Top-Trending-Dress-Colour-Combination-for-Men-in-2020-featured-Image.png"
//                 alt="Formal"
//                 className="style-img"
//               />
//               <span>Formal</span>
//             </div>
//             <div 
//               className="style-card party"
//               onClick={() => handleDressStyleClick('Party')}
//               style={{ cursor: 'pointer' }}
//             >
//               <img 
//                 src="https://24thspoke.in/cdn/shop/files/1706968840749.jpg?v=1716824704&width=1024"
//                 alt="Party"
//                 className="style-img"
//               />
//               <span>Party</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Testimonials */}
//       <section className="testimonials">
//         <div className="container">
//           <h2 className="section-title">OUR HAPPY CUSTOMERS</h2>
//           <div className="testimonial-grid">
//             <div className="testimonial-card">
//               <div className="stars">★★★★★</div>
//               <h4>Sarah M.</h4>
//               <p>"I love this dress! It's so comfortable and stylish. The quality is amazing and the fit is perfect."</p>
//             </div>
//             <div className="testimonial-card">
//               <div className="stars">★★★★★</div>
//               <h4>Alex X.</h4>
//               <p>"This dress is perfect for a casual day out. Great value for money and the material is excellent."</p>
//             </div>
//             <div className="testimonial-card">
//               <div className="stars">★★★★★</div>
//               <h4>James L.</h4>
//               <p>"I love this dress! It's so versatile and looks great with jeans. Highly recommended!"</p>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Home;






import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import './Home.css';
import modelImg from "../assets/b26fea69ccfd8aa5825862cdb9604a4fb4930464.jpg";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ---------------------------------------------------------------
// Fallback mock data (used only if the API call fails)
// Replace the placeholder objects with real product shapes if
// your ProductCard expects specific fields (id, name, price, image).
// ---------------------------------------------------------------
const mockNewArrivals = [
  // {
  //   id: 1,
  //   name: 'Sample New Arrival',
  //   price: 49.99,
  //   image: 'https://via.placeholder.com/300x400',
  //   category: 'casual',
  // },
];

const mockTopSelling = [
  // {
  //   id: 2,
  //   name: 'Sample Top Seller',
  //   price: 39.99,
  //   image: 'https://via.placeholder.com/300x400',
  //   category: 'formal',
  // },
];

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const navigate = useNavigate();

  // Fetch products from API
  useEffect(() => {
    fetchHomePageProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHomePageProducts = async () => {
    setLoading(true);
    try {
      // Fetch new arrivals
      const newArrivalsResponse = await fetch(
        `${API_URL}/products/new-arrivals`
      );
      if (!newArrivalsResponse.ok) {
        throw new Error(
          `new-arrivals request failed: ${newArrivalsResponse.status}`
        );
      }
      const newArrivalsData = await newArrivalsResponse.json();

      // Fetch on-sale products (top selling)
      const topSellingResponse = await fetch(`${API_URL}/products/on-sale`);
      if (!topSellingResponse.ok) {
        throw new Error(
          `on-sale request failed: ${topSellingResponse.status}`
        );
      }
      const topSellingData = await topSellingResponse.json();

      // Normalize response shape (array OR { products: [] })
      const newArrivalsList = Array.isArray(newArrivalsData)
        ? newArrivalsData
        : newArrivalsData.products || [];

      const topSellingList = Array.isArray(topSellingData)
        ? topSellingData
        : topSellingData.products || [];

      setNewArrivals(newArrivalsList.slice(0, 4));
      setTopSelling(topSellingList.slice(0, 4));
    } catch (error) {
      console.error('Error fetching products:', error);
      // Safe fallback — these constants are now defined above
      setNewArrivals(mockNewArrivals);
      setTopSelling(mockTopSelling);
    } finally {
      setLoading(false);
    }
  };

  // Function to navigate to dress style page
  const handleDressStyleClick = (style) => {
    navigate(`/category/${style.toLowerCase()}`);
  };

  if (loading) return <Loader />;

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-wrapper">
            <div className="hero-content">
              <h1>FIND CLOTHES THAT MATCHES YOUR STYLE</h1>
              <p>
                Browse through our diverse range of meticulously crafted
                garments, designed to bring out your individuality and cater to
                your sense of style.
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/products')}
              >
                Shop Now <span>→</span>
              </button>

              <div className="stats">
                <div className="stat">
                  <h3>200+</h3>
                  <p>International Brands</p>
                </div>
                <div className="stat">
                  <h3>2,000+</h3>
                  <p>High-Quality Products</p>
                </div>
                <div className="stat">
                  <h3>30,000+</h3>
                  <p>Happy Customers</p>
                </div>
              </div>
            </div>

            <div className="hero-image">
              <img src={modelImg} alt="Fashion Model" />
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="brands">
        <div className="container">
          <div className="brand-logos">
            <span>VERSACE</span>
            <span>ZARA</span>
            <span>GUCCI</span>
            <span>PRADA</span>
            <span>Calvin Klein</span>
          </div>
        </div>
      </section>

      {/* New Arrivals — Fetched from API */}
      {newArrivals.length > 0 && (
        <section className="products-section">
          <div className="container">
            <h2 className="section-title">NEW ARRIVALS</h2>
            <div className="product-grid">
              {newArrivals.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="view-all">
              <button
                className="btn-secondary"
                onClick={() => navigate('/products?filter=new')}
              >
                View All
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Top Selling — Fetched from API */}
      {topSelling.length > 0 && (
        <section className="products-section">
          <div className="container">
            <h2 className="section-title">TOP SELLING</h2>
            <div className="product-grid">
              {topSelling.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="view-all">
              <button
                className="btn-secondary"
                onClick={() => navigate('/products?filter=sale')}
              >
                View All
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Dress Style Section */}
      <section className="dress-style">
        <div className="container">
          <h2 className="section-title">BROWSE BY DRESS STYLE</h2>
          <div className="style-grid">
            <div
              className="style-card casual"
              onClick={() => handleDressStyleClick('Casual')}
              style={{ cursor: 'pointer' }}
            >
              <img
                src="https://assets.vogue.com/photos/67db1d379b250aa9279caf73/master/w_2560%2Cc_limit/Holding%2520Collage%2520(2).jpg"
                alt="Casual"
                className="style-img"
              />
              <span>Casual</span>
            </div>
            <div
              className="style-card gym"
              onClick={() => handleDressStyleClick('Gym')}
              style={{ cursor: 'pointer' }}
            >
              <img
                src="https://m.media-amazon.com/images/I/71hU6vBZwfL._AC_UY1100_.jpg"
                alt="Gym"
                className="style-img"
              />
              <span>Gym</span>
            </div>
            <div
              className="style-card formal"
              onClick={() => handleDressStyleClick('Formal')}
              style={{ cursor: 'pointer' }}
            >
              <img
                src="https://styl-inc.com/wp-content/uploads/2021/01/Top-Trending-Dress-Colour-Combination-for-Men-in-2020-featured-Image.png"
                alt="Formal"
                className="style-img"
              />
              <span>Formal</span>
            </div>
            <div
              className="style-card party"
              onClick={() => handleDressStyleClick('Party')}
              style={{ cursor: 'pointer' }}
            >
              <img
                src="https://24thspoke.in/cdn/shop/files/1706968840749.jpg?v=1716824704&width=1024"
                alt="Party"
                className="style-img"
              />
              <span>Party</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">OUR HAPPY CUSTOMERS</h2>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <h4>Sarah M.</h4>
              <p>
                "I love this dress! It's so comfortable and stylish. The quality
                is amazing and the fit is perfect."
              </p>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <h4>Alex X.</h4>
              <p>
                "This dress is perfect for a casual day out. Great value for
                money and the material is excellent."
              </p>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <h4>James L.</h4>
              <p>
                "I love this dress! It's so versatile and looks great with
                jeans. Highly recommended!"
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;