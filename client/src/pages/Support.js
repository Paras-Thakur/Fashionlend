import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaQuestionCircle, FaTruck, FaCreditCard, FaShieldAlt, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Support = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      id: 1,
      question: "How do I track my order?",
      answer: "You can track your order by visiting the 'Track Order' page and entering your Order ID and phone number. The Order ID can be found in your order confirmation email or in your orders page. You can use either the shortened 6-character Order ID (like #15603c) or the full 24-character Order ID."
    },
    {
      id: 2,
      question: "What is the rental duration?",
      answer: "Rental duration typically ranges from 1 to 7 days. You can select your preferred duration when placing the order. Longer rentals may be available upon request. The rental period starts from the delivery date and ends on the pickup date."
    },
    {
      id: 3,
      question: "How does payment work?",
      answer: "We accept Cash on Delivery (COD), online payments, and card payments. For COD orders, a 30% advance payment is required at the time of booking. The remaining 70% is collected upon delivery. For online payments, the full amount is charged upfront."
    },
    {
      id: 4,
      question: "What if the dress doesn't fit?",
      answer: "We recommend checking the size chart before ordering. If the dress doesn't fit, please contact us immediately within 2 hours of delivery. We'll try to arrange an exchange if a suitable size is available. Exchanges are subject to availability and may incur additional delivery charges."
    },
    {
      id: 5,
      question: "How do I return the dress?",
      answer: "Please return the dress in the same condition as received. Our delivery partner will collect the dress on the scheduled return date. Make sure to return all accessories, packaging, and garment bags. The dress should be clean and free from any damage or stains."
    },
    {
      id: 6,
      question: "What if I damage the dress?",
      answer: "Minor wear and tear is expected. However, significant damage may result in additional charges. Please handle the dress with care and avoid contact with food, liquids, or sharp objects. Any damage will be assessed and you may be charged for repairs or replacement."
    },
    {
      id: 7,
      question: "What are the delivery charges?",
      answer: "We offer free delivery and pickup for all orders. There are no additional delivery charges. Our delivery partner will contact you to schedule a convenient delivery time. Delivery is available in select cities and areas."
    },
    {
      id: 8,
      question: "Can I cancel my order?",
      answer: "Orders can be cancelled up to 24 hours before the scheduled delivery date. Cancellations made within 24 hours may incur a cancellation fee. For online payments, refunds will be processed within 5-7 business days."
    },
    {
      id: 9,
      question: "What sizes are available?",
      answer: "We offer a wide range of sizes from XS to XXL. Each product listing includes a detailed size chart. If you're unsure about your size, we recommend checking the size chart or contacting our customer support for assistance."
    },
    {
      id: 10,
      question: "How do I become a dress owner?",
      answer: "To become a dress owner and list your dresses for rent, you need to register as an owner on our platform. You'll need to provide necessary documentation and your dresses will be verified by our team. Contact us at owner@fashionlend.com for more information."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setContactForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12 text-center">
          <h1 className="h2 mb-3">
            <FaQuestionCircle className="me-3" />
            Customer Support
          </h1>
          <p className="text-muted">
            We're here to help you with any questions or concerns about your rental orders
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Contact Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <FaPhone className="me-3 text-primary" size={20} />
                    <div>
                      <h6 className="mb-1">Phone Support</h6>
                      <p className="mb-0">+91 98765 43210</p>
                      <small className="text-muted">Available 24/7</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <FaEnvelope className="me-3 text-primary" size={20} />
                    <div>
                      <h6 className="mb-1">Email Support</h6>
                      <p className="mb-0">support@fashionlend.com</p>
                      <small className="text-muted">Response within 24 hours</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <FaMapMarkerAlt className="me-3 text-primary" size={20} />
                    <div>
                      <h6 className="mb-1">Office Address</h6>
                      <p className="mb-0">123 Fashion Street, Mumbai, Maharashtra 400001</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <FaClock className="me-3 text-primary" size={20} />
                    <div>
                      <h6 className="mb-1">Business Hours</h6>
                      <p className="mb-0">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                      <small className="text-muted">Sunday: 10:00 AM - 6:00 PM</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Frequently Asked Questions</h5>
              <div className="input-group" style={{ maxWidth: '300px' }}>
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="card-body">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No FAQs found matching your search.</p>
                </div>
              ) : (
                <div className="accordion" id="faqAccordion">
                  {filteredFaqs.map((faq) => (
                    <div className="accordion-item" key={faq.id}>
                      <h2 className="accordion-header" id={`faq${faq.id}`}>
                        <button 
                          className={`accordion-button ${expandedFaq === faq.id ? '' : 'collapsed'}`}
                          type="button" 
                          onClick={() => toggleFaq(faq.id)}
                          aria-expanded={expandedFaq === faq.id}
                          aria-controls={`collapse${faq.id}`}
                        >
                          {faq.question}
                        </button>
                      </h2>
                      <div 
                        id={`collapse${faq.id}`} 
                        className={`accordion-collapse collapse ${expandedFaq === faq.id ? 'show' : ''}`}
                        data-bs-parent="#faqAccordion"
                      >
                        <div className="accordion-body">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Contact Us</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleContactFormSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">First Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="firstName" 
                      name="firstName"
                      value={contactForm.firstName}
                      onChange={handleContactFormChange}
                      required 
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="lastName" 
                      name="lastName"
                      value={contactForm.lastName}
                      onChange={handleContactFormChange}
                      required 
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email *</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email" 
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactFormChange}
                      required 
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number *</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      id="phone" 
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleContactFormChange}
                      required 
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="subject" className="form-label">Subject *</label>
                  <select 
                    className="form-select" 
                    id="subject" 
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactFormChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="order-tracking">Order Tracking</option>
                    <option value="payment-issue">Payment Issue</option>
                    <option value="delivery-problem">Delivery Problem</option>
                    <option value="size-exchange">Size Exchange</option>
                    <option value="damage-claim">Damage Claim</option>
                    <option value="become-owner">Become an Owner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Message *</label>
                  <textarea 
                    className="form-control" 
                    id="message" 
                    name="message"
                    rows="5" 
                    placeholder="Please describe your issue or question in detail..." 
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    required
                  ></textarea>
                </div>
                <div className="text-end">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    <FaEnvelope className="me-2" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Our Services</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <FaTruck className="text-primary mb-3" size={40} />
                    <h6>Free Delivery</h6>
                    <p className="text-muted small">Free delivery and pickup for all orders</p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <FaCreditCard className="text-primary mb-3" size={40} />
                    <h6>Secure Payment</h6>
                    <p className="text-muted small">Multiple secure payment options available</p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="text-center">
                    <FaShieldAlt className="text-primary mb-3" size={40} />
                    <h6>Quality Assurance</h6>
                    <p className="text-muted small">All dresses are professionally cleaned and maintained</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support; 