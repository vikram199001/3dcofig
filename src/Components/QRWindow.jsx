import React from 'react'; 
import { Container, Modal, Col, Row, Image } from 'react-bootstrap';

const QRWindow = (props) => {
    const { showQR, setShowQR  } = props;
    
    const handleClose = () => {
        setShowQR(false);
    };

    return (
        <Modal 
            show={showQR} 
            onHide={handleClose}
            size="lg"
            centered
            className="qr-modal"
        >
            <Modal.Body>
                <Container>
                <Row>
                    <Col md={12} className='text-center'>
                        <Image src={require('../assets/images/qrcode_Sofa_BlackLeather_EbonyLegs_Round.png')} className='w-50'/>
                    </Col>
                </Row>
                </Container>
            </Modal.Body>
        </Modal>
    );
};

export default QRWindow;