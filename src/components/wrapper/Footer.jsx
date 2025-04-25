import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3 sticky-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-2 mb-md-0">
              <div className="d-flex justify-content-md-cente align-items-center">
                <span className="fw-bold me-2 text-white">OMR Scanner</span>
                <span className="small text-white-50">|</span>
                <span className="small text-white-50 mx-2">© {new Date().getFullYear()}</span>
              </div>
            </Col>
            <Col md={6} className="mb-2 mb-md-0">
              <div className="d-flex justify-content-md-center">
                <a href="#" className="text-decoration-none text-white-50 small mx-2">About</a>
                <a href="#" className="text-decoration-none text-white-50 small mx-2">Privacy</a>
                <a href="#" className="text-decoration-none text-white-50 small mx-2">Terms</a>
                <a href="#" className="text-decoration-none text-white-50 small mx-2">Contact</a>
              </div>
            </Col>
            {/* <Col md={3}>
              <div className="d-flex justify-content-md-end">
                <a href="#" className="me-3 text-decoration-none text-white-50"><i className="bi bi-facebook"></i></a>
                <a href="#" className="me-3 text-decoration-none text-white-50"><i className="bi bi-twitter"></i></a>
                <a href="#" className="me-3 text-decoration-none text-white-50"><i className="bi bi-linkedin"></i></a>
                <a href="#" className="text-decoration-none text-white-50"><i className="bi bi-instagram"></i></a>
              </div>
            </Col> */}
          </Row>
        </Container>
      </footer>
  )
}

export default Footer
