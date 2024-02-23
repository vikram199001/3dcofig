import React from "react";
import { Container, Row, Col, Image } from 'react-bootstrap';

const Footer = () => {
    return <footer className="footer-page font-small blue pt-4">
    <Container className="text-center text-md-end">
        <Row className="p-5">
            <Col md={4} className="mt-md-0 mt-3 text-start">
                <p className=" mb-5">
                    <Image src={require('../assets/images/logo.png')} width={'20%'}/>
                </p>
                
                <p>Sydneystraat 37, 3047 BP Rotterdam</p>
                <p><a>+31 (0)10 307 6142</a></p>
                <p><a>+31 (0)10 307 6142</a></p>
            </Col>

            <Col md={2} className="mb-md-0 mb-3 text-start">
                <p className="text-uppercase mb-5">Verior</p>
                <p>Contact</p>
                <p>Brochure</p>
                <p>Privacy Policy</p>
                <p>Copyright</p>
            </Col>

            <Col md={2} className="mb-md-0 mb-3 text-start">
                <p className="text-uppercase mb-5">Modular Solutions</p>
                <p>Buitenverblijven</p>
                <p>Tuinkantoren</p>
                <p>Mantelzorg</p>
                <p>Wellness</p>
            </Col>
            <Col md={2} className="mb-md-0 mb-3 text-start">
                <p className="text-uppercase mb-5">Nieuwsbrief</p>
                <p>
                    <input className="p-2" type="text" placeholder="Aanmelden nieuwsbrief"/>
                </p>
                <p>Laat je inspireren door onze innovatieve en modulaire oplossingen.</p>
            </Col>
        </Row>
    </Container>
</footer>

}
export default Footer;