import React from 'react';

const Section8FAQ = () => {
  return (
    <section className="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div className="faq">
        <h3>How does VisionX compare to other cloud services?</h3>
        <p>VisionX offers a wider range of GPU types, including those not available from major cloud providers. Plus, it’s serverless—so you don’t need to worry about infrastructure management.</p>
      </div>
      <div className="faq">
        <h3>Can I track my job’s progress?</h3>
        <p>Yes, you can monitor real-time logs and see the status of your job through our dashboard or CLI.</p>
      </div>
      <div className="faq">
        <h3>Is my data secure?</h3>
        <p>Absolutely. We use industry-standard encryption to ensure that your data is stored and transmitted securely.</p>
      </div>
    </section>
  );
};

export default Section8FAQ;
