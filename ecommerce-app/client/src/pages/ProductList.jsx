





import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { fetchProducts } from '../redux/slices/productSlice';
import './Productlist.css'
const ProductList = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { products, loading } = useSelector(
    (state) => state.products
  );

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');

    let filtered = [...products];

    // New Arrivals
    if (filter === 'new') {
      filtered = filtered.filter(
        (product) => product.isNewArrival === true
      );
    }

    // On Sale
    if (filter === 'onsale') {
      filtered = filtered.filter(
        (product) => product.isOnSale === true
      );
    }

    // Category Filter
    if (category !== 'all') {
      filtered = filtered.filter(
        (product) => product.category === category
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortBy === 'price-desc') {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    }

    setFilteredProducts(filtered);
  }, [products, category, sortBy, location.search]);

  if (loading) return <Loader />;

  return (
    <div className="product-list">
      <div className="container">

        <div className="page-header">
          <h2>
            {new URLSearchParams(location.search).get('filter') === 'new'
              ? 'New Arrivals'
              : new URLSearchParams(location.search).get('filter') === 'onsale'
              ? 'On Sale Products'
              : 'All Products'}
          </h2>
        </div>

        <div className="filters">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="men's clothing">
              Men's Clothing
            </option>
            <option value="women's clothing">
              Women's Clothing
            </option>
            <option value="jewelery">
              Jewelery
            </option>
            <option value="electronics">
              Electronics
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="price-asc">
              Price: Low to High
            </option>
            <option value="price-desc">
              Price: High to Low
            </option>
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-products">
            <h3>No products found</h3>
            <p>
              No products available for this filter.
            </p>
          </div>
        ) : (
          <div className="grid-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>

   
    </div>
  );
};

export default ProductList;