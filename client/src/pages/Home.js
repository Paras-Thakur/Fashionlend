import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const states = [
    { name: 'Andhra Pradesh', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346376/andraprad_gihcsu.png' },
    { name: 'Arunachal Pradesh', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346377/arunachalpradesh_mlduix.png' },
    { name: 'Assam', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346369/assam_phr5o5.png' },
    { name: 'Bihar', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346386/bihar_ncyark.png' },
    { name: 'Chhattisgarh', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346390/chattisgarh_bsl295.png' },
    { name: 'Goa', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346395/goaaa_pngemk.png' },
    { name: 'Gujarat', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346393/gujarat_elasoz.png' },
    { name: 'Haryana', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346394/haryana_zpxxmu.png' },
    { name: 'Himachal Pradesh', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346419/himachal_mbpacb.png' },
    { name: 'Jharkhand', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346407/jharkhand_htmlsa.png' },
    { name: 'Karnataka', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346423/karnataka_olyajv.png' },
    { name: 'Kerala', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346419/kerala_gu6rnf.png' },
    { name: 'Madhya Pradesh', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346424/madhyapradesh_t81uud.png' },
    { name: 'Maharashtra', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346376/maharastra_gx9lrg.png' },
    { name: 'Manipur', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346377/manipur_grqr9h.png' },
    { name: 'Meghalaya', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346376/meghalya_egb7w4.png' },
    { name: 'Mizoram', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346376/mizoram_ygozc7.png' },
    { name: 'Nagaland', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346394/nagaland_igijkb.png' },
    { name: 'Odisha', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346396/odisha_xoyhln.png' },
    { name: 'Punjab', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346407/punjab_w6ivu3.png' },
    { name: 'Rajasthan', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346410/rajasthan_eyvzfi.png' },
    { name: 'Sikkim', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346416/sikkim_il581e.png' },
    { name: 'Tamil Nadu', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346428/tamilnadu_twuhcr.png' },
    { name: 'Telangana', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346411/telengana_qven2n.png' },
    { name: 'Tripura', image: 'https://res.cloudinary.com/drhhstpng/image/upload/tripura_wy0zqf.png' },
    { name: 'Uttar Pradesh', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346429/uttarpradesh_onpmlx.png' },
    { name: 'Uttarakhand', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346430/uttarakhand_vhkpfz.png' },
    { name: 'West Bengal', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346430/westbengal_d9celh.png' },
    { name: 'Delhi', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346386/delhi_vr9k4g.png' },
    { name: 'Jammu & Kashmir', image: 'https://res.cloudinary.com/drhhstpng/image/upload/v1755346415/jammu_gfljnf.png' }
  ];

  return (
    <div>
      {/* Carousel */}
      <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img 
              src="https://rentitbae.s3.ap-southeast-1.amazonaws.com/Rental+process.png+910x400.png" 
              className="d-block w-100" 
              alt="Rental Process"
            />
          </div>
          <div className="carousel-item">
            <img 
              src="https://rentitbae.s3.ap-southeast-1.amazonaws.com/Emergency+910x400.jpg" 
              className="d-block w-100" 
              alt="Emergency"
            />
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Traditional Threads */}
      <div className="container-fluid px-0">
        <h1 className="hello text-center mt-4 mb-4 text-white bg-black py-3">Traditional Threads</h1>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="sc">
                <div className="row justify-content-center g-3">
                  {states.map((state, index) => (
                    <div key={index} className="col-auto">
                      <Link to={`/products/state/${encodeURIComponent(state.name)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="text-center">
                          <img className="img1" src={state.image} alt={state.name} />
                          <h5 className="head1 mt-2">{state.name}</h5>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Men's Collection */}
      <div className="container-fluid px-0">
        <h3 className="hello text-center pt-3 pb-3 mt-5 mb-4 text-white bg-black">MEN'S COLLECTION</h3>
      </div>
      <div className="container">
        <div className="row justify-content-center g-4">
          <div className="col-lg-4 col-md-6 col-sm-12">
            <Link to="/products/category/sherwani" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card h-100 shadow-sm">
                <img 
                  src="https://rentitbae.s3.ap-southeast-1.amazonaws.com/Sherwani.JPG+455x400.jpg" 
                  className="card-img-top" 
                  alt="Sherwani"
                  style={{ height: '300px', objectFit: 'cover' }}
                />
              </div>
            </Link>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-12">
            <Link to="/products/category/indo-western" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card h-100 shadow-sm">
                <img 
                  src="https://rentitbae.s3.ap-southeast-1.amazonaws.com/Indo+western+option+2+455x400.PNG" 
                  className="card-img-top" 
                  alt="Indo Western"
                  style={{ height: '300px', objectFit: 'cover' }}
                />
              </div>
            </Link>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-12">
            <Link to="/products/category/tuxedo" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card h-100 shadow-sm">
                <img 
                  src="https://rentitbae.s3.ap-southeast-1.amazonaws.com/Tuxe+455x400.PNG+option+2.png" 
                  className="card-img-top" 
                  alt="Tuxedo"
                  style={{ height: '300px', objectFit: 'cover' }}
                />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* More From Men's Collection */}
      <div className="container mt-5">
        <h3 className="hello text-center mb-4 fw-bold">More From Men's Collection</h3>
        <div className="navbar-categories">
          <Link to="/products/category/shirts" className="navbar-category-item">
            <span className="navbar-category-icon">👔</span>
            <span className="navbar-category-text">Shirts</span>
          </Link>
          <Link to="/products/category/blazers" className="navbar-category-item">
            <span className="navbar-category-icon">🧥</span>
            <span className="navbar-category-text">Blazers</span>
          </Link>
          <Link to="/products/category/jackets" className="navbar-category-item">
            <span className="navbar-category-icon">🛡️</span>
            <span className="navbar-category-text">Jackets</span>
          </Link>
          <Link to="/products/category/coats" className="navbar-category-item">
            <span className="navbar-category-icon">🧥</span>
            <span className="navbar-category-text">Coats</span>
          </Link>
          <Link to="/products/category/pants" className="navbar-category-item">
            <span className="navbar-category-icon">👖</span>
            <span className="navbar-category-text">Pants</span>
          </Link>
          <Link to="/products/category/sweaters" className="navbar-category-item">
            <span className="navbar-category-icon">🧶</span>
            <span className="navbar-category-text">Sweaters</span>
          </Link>
        </div>
      </div>

      {/* Women's Collection */}
      <div className="container-fluid px-0">
        <h3 className="hello text-center pt-3 pb-3 mt-5 mb-4 text-white bg-black">WOMEN'S COLLECTION</h3>
      </div>
      <div className="container">
        <div className="row justify-content-center g-4">
          <div className="col-lg-4 col-md-6 col-sm-12">
            <Link to="/products/category/lehenga" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card h-100 shadow-sm">
                <img 
                  src="https://rentitbae.s3.ap-southeast-1.amazonaws.com/Lehengas+455x400.JPG" 
                  className="card-img-top" 
                  alt="Lehengas"
                  style={{ height: '300px', objectFit: 'cover' }}
                />
              </div>
            </Link>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-12">
            <Link to="/products/category/anarkali" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card h-100 shadow-sm">
                <img 
                  src="https://rentitbae.s3.ap-southeast-1.amazonaws.com/Anarkalis+455x400.jpg" 
                  className="card-img-top" 
                  alt="Anarkalis"
                  style={{ height: '300px', objectFit: 'cover' }}
                />
              </div>
            </Link>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-12">
            <Link to="/products/category/gown" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card h-100 shadow-sm">
                <img 
                  src="https://rentitbae.s3.ap-southeast-1.amazonaws.com/Gown+455x400.JPG" 
                  className="card-img-top" 
                  alt="Gowns"
                  style={{ height: '300px', objectFit: 'cover' }}
                />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* More From Women's Collection */}
      <div className="container mt-5">
        <h3 className="hello text-center mb-4 fw-bold">More From Women's Collection</h3>
        <div className="navbar-categories">
          <Link to="/products/category/weightless-lehengas" className="navbar-category-item">
            <span className="navbar-category-icon">👗</span>
            <span className="navbar-category-text">Weightless Lehengas</span>
          </Link>
          <Link to="/products/category/gown" className="navbar-category-item">
            <span className="navbar-category-icon">👸</span>
            <span className="navbar-category-text">Gowns</span>
          </Link>
          <Link to="/products/category/kitty-special" className="navbar-category-item">
            <span className="navbar-category-icon">🎀</span>
            <span className="navbar-category-text">Kitty Special</span>
          </Link>
          <Link to="/products/category/festive-special" className="navbar-category-item">
            <span className="navbar-category-icon">🎊</span>
            <span className="navbar-category-text">Festive Special</span>
          </Link>
          <Link to="/products/category/kurtis" className="navbar-category-item">
            <span className="navbar-category-icon">👘</span>
            <span className="navbar-category-text">Kurtis</span>
          </Link>
          <Link to="/products/category/haldi-special" className="navbar-category-item">
            <span className="navbar-category-icon">🌻</span>
            <span className="navbar-category-text">Haldi Special</span>
          </Link>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="container-fluid px-0 mt-5 mb-5">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img 
              src="https://img.faballey.com/images/banner/33747e66-1164-4a35-b50c-902067329a69.jpg" 
              className="d-block w-100" 
              alt="Banner"
            />
          </div>
        </div>
      </div>


    </div>
  );
};

export default Home; 