import React, {Suspense, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Accordion, Col, Button, Image } from 'react-bootstrap';
import SofaModel from "./SofaModel";
import QRWindow from "./QRWindow";
import { selectchairMaterialType, selectLegMaterialType, selectsofaColor, selectLegType, selectLegColor } from '../redux/slices';

const Home = () => {

    const chairMaterial  = useSelector((state) =>state.configurator.chairMaterial);
    const selectedChairMaterial  = useSelector((state) =>state.configurator.selectedChairMaterial);
    const LegMaterial  = useSelector((state) =>state.configurator.LegMaterial);
    const selectedLegMaterial  = useSelector((state) =>state.configurator.selectedLegMaterial);
    const selectedSofaColor  = useSelector((state) =>state.configurator.selectedSofaColor);
    const sofaColorOptions  = useSelector((state) =>state.configurator.sofaColorOptions);
    const legType  = useSelector((state) =>state.configurator.legType);
    const legTypeOption  = useSelector((state) =>state.configurator.legTypeOption);
    const legColor  = useSelector((state) =>state.configurator.legColor);
    const legColorOptions  = useSelector((state) =>state.configurator.legColorOptions);
    const [ toggle, setToggle] = useState(false);
    const [ toggleSub, setToggleSub] = useState(false);
    const [ showQr, setShowQr ] = useState(false);
    const dispatch = useDispatch();



    return <Container className="w-100 home-page">
                <Row>
                    <Col md={7} sm={12} className="sofa-modal">
                        <div>
                        <Suspense>
                            <SofaModel
                                selectedChairMaterial={selectedChairMaterial}
                                selectedLegMaterial={selectedLegMaterial}
                                selectedSofaColor={selectedSofaColor}
                                legType={legType}
                                legColor={legColor}
                            />
                        </Suspense> 
                        </div>
                       

                        <Button className="my-3" onClick={() =>{ 
                            setShowQr(true)
                        }}>
                        {'Bekijken in je eigen ruimte'}
                        </Button>
                        <QRWindow
                            showQR={showQr}
                            setShowQR={setShowQr}

                        />
                        
                      
                    </Col>
                    <Col md={5} sm={12}>
                        <Container className="p-md-5">
                            <Row>
                            <Container>
                                <Row>
                                    <Col><p className="sub-head">Bankstel "Rotterdam Luxe"</p></Col>
                                </Row>
                                <Accordion flush>
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header>Materiaal</Accordion.Header>
                                            <Accordion.Body className="pe-5">
                                                {
                                                    chairMaterial && chairMaterial.map((m, i) =>
                                                        <>
                                                        <p 
                                                            defaultActiveKey={i} 
                                                            flush 
                                                            className={m.name === selectedChairMaterial.name ? "sub-cat-selected" : "sub-cat"}
                                                            onClick={() => { dispatch(selectchairMaterialType(m.name)); setToggle(!toggle)}}
                                                        >
                                                            
                                                        {m.name}
                                                        </p>
                                                               
                                                        {(m.name === selectedChairMaterial.name && toggle) && 
                                                            <Row>
                                                                            {sofaColorOptions[`${m.name}`].map((c) => 
                                                                            <Col className="d-grid justify-content-center" onClick={() => dispatch(selectsofaColor(c))}>
                                                                                <span className={c.name === selectedSofaColor.name ? `selected-color ${c.name}`: `${c.name} color`}></span>
                                                                                <p>{c.name}</p>
                                                                            </Col> )}
                                                            </Row>
                                                        }
                                                        </>
                                                     )
                                                }
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="1">
                                            <Accordion.Header>Onderstel</Accordion.Header>
                                            <Accordion.Body className="pe-5">
                                                
                                                    <div className="d-flex">
                                                   { legTypeOption && legTypeOption.map((l, i) => 
                                                    <div className="text-center">
                                                        <Image src={require(`../assets/images/${l.image}`)}
                                                            className={l.name === legType.name ? "sub-cat-selected" : "sub-cat"}
                                                            key={i} 
                                                            width={'50%'}
                                                            onClick={() => { dispatch(selectLegType(l)); setToggle(!toggle) }}
                                                        />       
                                                       <p>{l.name}</p>
                                                    </div>)
                                                    }
                                                    </div>  
                                            
                                                  {(legType.name && toggle) && 
                                                            <Row className="ps-5">
                                                                        {LegMaterial && LegMaterial.map((m, k) =>
                                                                            <>
                                                                            <p className={m.name === selectedLegMaterial.name ? "sub-cat-selected mb-2" : "sub-cat mb-2"}
                                                                                key={k} 
                                                                                onClick={() => { dispatch(selectLegMaterialType(m)); setToggleSub(!toggleSub) }}
                                                                            >
                                                                                {m.name}
                                                                            </p>
                                                                            {(m.name === selectedLegMaterial.name && toggleSub) && 
                                                                                <Row>
                                                                                    {legColorOptions && legColorOptions[`${m.name}`].map((c, p) =>
                                                                                        <Col className="d-grid justify-content-center" onClick={() => dispatch(selectLegColor(c))}>
                                                                                            <span className="d-flex justify-content-center">
                                                                                                <Image 
                                                                                                    src={require(`../assets/images/${c.image}`)} 
                                                                                                    className={c.name === legColor.name ? `selected-color ${c.name}`: `${c.name} color`}
                                                                                                />
                                                                                            </span>
                                                                                            <p>{c.name}</p>
                                                                                        </Col>  
                                                                                    )}
                                                                                </Row>
                                                                            }
                                                                            </>
                                                                        )}
                                                            </Row>
                                                }
                                              
                                            </Accordion.Body>
                                        </Accordion.Item>
                                       
                                </Accordion>
                            </Container>
                            </Row>
                            <Row className="mt-2">
                                <Col className="text-start">
                                <p className="sub-detail text-start">TOTAALPRIJS INCL. BTW.</p>
                                <h2>€1,250.00</h2>
                                </Col>
                            </Row>
                            <Row className="mt-5">
                                <Col>
                                    <Button variant="dark rect-btn">Offerte aanvragen</Button>
                                    <Button variant="outline-light rect-btn black mx-2">Brochure aanvragen</Button>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                </Row>

            </Container>
}

export default Home;