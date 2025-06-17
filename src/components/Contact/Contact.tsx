import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  User,
  MessageSquare,
  Star,
  FileText,
  CheckCircle,
  Share2,
  ArrowLeft,
} from "lucide-react";
import "./Contact.css";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // const validateForm = () => {
  //   const newErrors: any = {};

  //   if (!formData.name.trim()) {
  //     newErrors.name = "Name is required";
  //   }

  //   if (!formData.email.trim()) {
  //     newErrors.email = "Email is required";
  //   } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
  //     newErrors.email = "Email is invalid";
  //   }

  //   if (!formData.subject.trim()) {
  //     newErrors.subject = "Subject is required";
  //   }

  //   if (!formData.message.trim()) {
  //     newErrors.message = "Message is required";
  //   } else if (formData.message.trim().length < 10) {
  //     newErrors.message = "Message must be at least 10 characters long";
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // if (!validateForm()) {
    //   return;
    // }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        priority: "medium",
      });
      setErrors({});
    }, 3000);
  };

  const contactInfo = [
    {
      icon: (
        <Mail
          className="contact-info-icon"
          style={{ color: "#2563eb", width: 24, height: 24 }}
        />
      ),
      title: "Email Us",
      content: "baoquoc@gmail.com",
      description: "Send us an email anytime!",
    },
    {
      icon: (
        <Phone
          className="contact-info-icon"
          style={{ color: "#16a34a", width: 24, height: 24 }}
        />
      ),
      title: "Call Us",
      content: "+84 868 123 456",
      description: "Monday - Friday from 8:30 AM to 5:30 PM",
    },
    {
      icon: (
        <MapPin
          className="contact-info-icon"
          style={{ color: "#dc2626", width: 24, height: 24 }}
        />
      ),
      title: "Visit Us",
      content: "307/12 Nguyen Van Troi Street, Ward 1 ",
      description: "Tan Binh District, Ho Chi Minh City",
    },
    {
      icon: (
        <Clock
          className="contact-info-icon"
          style={{ color: "#7c3aed", width: 24, height: 24 }}
        />
      ),
      title: "Working Hours",
      content: "Monday - Friday",
      description: "8:30 AM - 5:30 PM",
    },
    {
      icon: (
        <Share2
          className="contact-info-icon"
          style={{ color: "#f59e0b", width: 24, height: 24 }}
        />
      ),
      title: "Follow Us",
      content: (
        <div className="contact-social-links">
          <a
            href="https://www.facebook.com/Google"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          <a
            href="https://www.instagram.com/microsoft"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://twitter.com/Apple"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
        </div>
      ),
      description: "Stay connected with us on social media!",
    },
  ];

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Customer Success Manager",
      email: "sarahjohnson@gmail.com",
      avatar: "👩‍💼",
    },
    {
      name: "Mike Chen",
      role: "Technical Support Lead",
      email: "mikechen@gmail.com",
      avatar: "👨‍💻",
    },
    {
      name: "Emily Davis",
      role: "Sales Representative",
      email: "emilydavis@gmail.com",
      avatar: "👩‍💻",
    },
    {
      name: "Jelly Mika",
      role: "Account Executive",
      email: "robertmika@gmail.com",
      avatar: "👩‍💼",
    },
  ];

  const faqs = [
    {
      question: "How quickly do you respond to support requests?",
      answer:
        "We typically respond within 2-4 hours during business hours, and within 24 hours on weekends.",
    },
    {
      question: "What support channels do you offer?",
      answer:
        "We offer email support, live chat, phone support, and a comprehensive knowledge base.",
    },
    {
      question: "Do you provide 24/7 support?",
      answer:
        "We offer 24/7 support for enterprise customers. Standard support is available Monday-Friday 8:30 AM - 5:30 PM.",
    },
  ];

  if (submitted) {
    return (
      <div className="contact-min-h-screen contact-center">
        <div className="contact-card">
          <div className="contact-success-icon-bg">
            <CheckCircle style={{ width: 32, height: 32, color: "#16a34a" }} />
          </div>
          <h3 className="contact-success-title">Message Sent!</h3>
          <p className="contact-success-text">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <div className="contact-success-bar-bg">
            <div className="contact-success-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-min-h-screen">
      <button onClick={handleBack} className="contact-back-button">
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </button>
      {/* Header Section */}
      <div className="contact-header-bg">
        <div className="contact-container">
          <div>
            <h1 className="contact-header-title">Get in Touch</h1>
            <p className="contact-header-desc">
              We'd love to hear from you. Send us a message and we'll respond as
              soon as possible.
            </p>
          </div>
        </div>
      </div>

      <div
        className="contact-container"
        style={{ paddingTop: 48, paddingBottom: 48 }}
      >
        {/* Main Content Grid: Form + Sidebar */}
        <div className="contact-main-layout">
          {/* Contact Form - Left Side */}
          <div className="contact-form-container">
            <div className="contact-form-card">
              <div className="contact-form-header">
                <MessageSquare className="contact-form-header-icon" />
                <h2 className="contact-form-header-title">Send us a Message</h2>
              </div>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-row">
                  <div>
                    <label className="contact-label">Full Name</label>
                    <div className="contact-input-wrap">
                      <User className="contact-input-icon" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`contact-input ${
                          errors.name ? "contact-input-error" : ""
                        }`}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    {errors.name && (
                      <span className="contact-error">{errors.name}</span>
                    )}
                  </div>
                  <div>
                    <label className="contact-label">Email Address</label>
                    <div className="contact-input-wrap">
                      <Mail className="contact-input-icon" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`contact-input ${
                          errors.email ? "contact-input-error" : ""
                        }`}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    {errors.email && (
                      <span className="contact-error">{errors.email}</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="contact-label">Subject</label>
                  <div className="contact-input-wrap">
                    <FileText className="contact-input-icon" />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`contact-input ${
                        errors.subject ? "contact-input-error" : ""
                      }`}
                      placeholder="What's this about?"
                      required
                    />
                  </div>
                  {errors.subject && (
                    <span className="contact-error">{errors.subject}</span>
                  )}
                </div>
                <div>
                  <label className="contact-label">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={(e) => {
                      handleInputChange(e);
                      e.target.style.color =
                        e.target.value === "" ? "gray" : "black";
                    }}
                    className="contact-select"
                    style={{
                      color: formData.priority === "" ? "gray" : "black",
                    }}
                    required
                  >
                    <option value="" disabled hidden>
                      -- Select priority --
                    </option>
                    <option value="low">🔵 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                    <option value="urgent">⚡ Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="contact-label">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className={`contact-textarea ${
                      errors.message ? "contact-input-error" : ""
                    }`}
                    placeholder="Tell us more about your inquiry..."
                    required
                  />
                  {errors.message && (
                    <span className="contact-error">{errors.message}</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="contact-btn"
                >
                  {isSubmitting ? (
                    <>
                      <div className="contact-spinner"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="contact-btn-icon" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="contact-sidebar">
            {/* Contact Info */}
            <div className="contact-info-card">
              <h3 className="contact-info-title">Contact Information</h3>
              <div className="contact-info-list">
                {contactInfo.map((info, index) => (
                  <div key={index} className="contact-info-item">
                    <div className="contact-info-icon">{info.icon}</div>
                    <div>
                      <h4 className="contact-info-content-title">
                        {info.title}
                      </h4>
                      <p className="contact-info-content-main">
                        {info.content}
                      </p>
                      <p className="contact-info-content-desc">
                        {info.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Members */}
          </div>
        </div>

        {/* FAQ Section - Full Width Below */}
        <div className="contact-faq-section">
          <div className="contact-team-card">
            <h3 className="contact-team-title">Our Team</h3>
            <div className="contact-team-list">
              {teamMembers.map((member, index) => (
                <div key={index} className="contact-team-item">
                  <div className="contact-team-avatar">{member.avatar}</div>
                  <div className="contact-team-details">
                    <h4 className="contact-team-name">{member.name}</h4>
                    <p className="contact-team-role">{member.role}</p>
                    <p className="contact-team-email">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="contact-faq-card">
            <h3 className="contact-faq-title">Frequently Asked Questions</h3>
            <div className="contact-faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="contact-faq-item">
                  <h4 className="contact-faq-q">
                    <Star className="contact-faq-icon" />
                    {faq.question}
                  </h4>
                  <p className="contact-faq-a">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="contact-footer-bg">
        <div className="contact-container">
          <div>
            <h3 className="contact-footer-title">Need immediate assistance?</h3>
            <p className="contact-footer-desc">
              For urgent matters, please call us directly at{" "}
              <span className="contact-footer-highlight">+84 868 123 456</span>
            </p>
            <div className="contact-footer-status">
              <div className="contact-footer-status-item">
                <div className="contact-footer-dot"></div>
                Online Support Available
              </div>
              <div className="contact-footer-status-item">
                <Clock className="contact-footer-clock" />
                Response within 2-4 hours
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
