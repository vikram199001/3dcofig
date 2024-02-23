import React from 'react';
import  { Container, Navbar, Nav, NavDropdown} from 'react-bootstrap';


const Header = () => {
  return <div className='header'> 
    <Navbar expand="lg" className="bg-body-tertiary p-3">
        <Container className='px-md-5 px-3 m-0'>
        <Navbar.Brand href="#home">
          <img
            src={require("../assets/images/logo.png")}
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="React Bootstrap logo"
          />
        
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav justify-content-end" />
          <Navbar.Collapse id="basic-navbar-nav" className='text-center'>
            <Nav variant="underline" defaultActiveKey="/home" className='px-5'>
        <Nav.Item className='p-2'>
          <Nav.Link href="/home">Buitenverblijven</Nav.Link>
        </Nav.Item>
        <Nav.Item className='p-2'>
          <Nav.Link eventKey="link-1">Tuinkantoren</Nav.Link>
        </Nav.Item>
        <Nav.Item className='p-2'>
          <Nav.Link eventKey="link-2">Mantelzorgwoningen</Nav.Link>
        </Nav.Item>
        <Nav.Item className='p-2'>
          <Nav.Link eventKey="link-3">Wellness</Nav.Link>
        </Nav.Item>
        <Nav.Item className='p-2'>
        <Nav.Link eventKey="link-4">
          Verior
        </Nav.Link>
        </Nav.Item>
        <Nav.Item className='p-2'>
        <Nav.Link eventKey="link-5">
          Contact
        </Nav.Link>
        </Nav.Item>
            </Nav>
          </Navbar.Collapse>
    </Container>
    </Navbar>
</div>
}

export default Header;