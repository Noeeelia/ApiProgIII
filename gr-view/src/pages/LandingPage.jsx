import React from "react";   
import '../assets/css/LandingPage.css';

import mujerAuto from '../assets/images/mujer-auto.jpg';

import Form from 'react-bootstrap/Form';

import Button from 'react-bootstrap/Button';





const LandingPage = () => {

    return (

        <div className="landing-page">

            <section id="portada" className="portada">

                <div className="portada__imagen" style={{backgroundImage: `url(${mujerAuto})`}}></div>

                <div className="portada__texto-container">

                    <div className="portada__texto">

                        <h1>Bienvenida a Concesionaria PROG III</h1>

                        <h4>Tu concesionaria amiga para el mejor mantenimiento de tu vehículo</h4>

                        <p>Gestiona tus reclamos de manera sencilla y eficiente</p>

                        <p>Para más información sobre nuestros servicios contáctanos.</p>

                        <p>Siempre es un gusto proporcionarte el mejor asesoramiento.</p>

                    </div>

                </div>

            </section>



            

            <section className="marcas-iconos">

                        <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/Renault-300x300.png'} alt="Logo de la marca"  />

                        <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/Toyota-300x262.jpg'} alt="Logo de la marca"  />

                        <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/peugeot-300x211.png'} alt="Logo de la marca" />

                        <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/volkswagen-300x282.jpg'} alt="Logo de la marca"  />         

                        <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/Ford-300x113.png'} alt="Logo de la marca"  />

            </section>

            

            <section id="informacion"  className="informacion">

                <h2>Sobre Nosotros</h2>

                <p>Somos una empresa comprometida con la satisfacción del cliente. Brindamos los mejores servicios automotrices.</p>

                <p>Calidad, buen trato y un servicio de atención al cliente de primera.</p>

                <br />

                <h2>Nuestro Compromiso</h2>

                <p>Ofrecemos una amplia gama de servicios para mantener tu vehículo en las mejores condiciones.</p>

            </section>



            <div className="marcas-iconos">                  

                <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/Citroen-300x225.png'} alt="Logo de la marca"  />

                <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/chevrolet-300x157.jpg'} alt="Logo de la marca"  />

                <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/nissan-300x254.jpg'} alt="Logo de la marca"  />

                <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/MercedesBenz-300x240.jpg'} alt="Logo de la marca"  />   

                <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/Honda-300x194.png'} alt="Logo de la marca"  />                 

            </div>



            <div className="informacion__container">

                    <div className="informacion__item">

                        <img width="80" height="80" src="https://img.icons8.com/officel/80/goal--v1.png" alt="goal--v1"/>

                        <h3>Misión</h3>

                        <p>Nuestra misión es proporcionar servicios automotrices de alta calidad que superen las expectativas de nuestros clientes.</p>

                    </div>

                    <div className="informacion__item">

                        <img width="80" height="80" src="https://img.icons8.com/sci-fi/96/visible.png" alt="visible"/>                        <h3>Visión</h3>

                        <p>Nuestra visión es ser líderes en el mercado automotriz, ofreciendo servicios de vanguardia y satisfaciendo las necesidades de nuestros clientes.</p>

                    </div>

                    <div className="informacion__item">

                        <img width="80" height="80" src="https://img.icons8.com/officel/80/trust.png" alt="trust"/>                        <h3>Valores</h3>

                        <p>Nuestros valores son la calidad, el servicio al cliente, la innovación y la responsabilidad social.</p>

                    </div>

                </div>



                <section className="marcas-iconos">

                <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/Subaru-300x175.png'} alt="Logo de la marca" />

                    <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/bmw-300x300.jpg'} alt="Logo de la marca"  />                    

                    <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/Audi-300x104.jpg'} alt="Logo de la marca"  />

                    <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/alfaromeo-300x236.jpg'} alt="Logo de la marca" />

                    <img src={'https://www.race.es/revista-autoclub/wp-content/uploads/sites/4/2016/09/Skoda-300x198.jpg'} alt="Logo de la marca" />

                </section>

              



            <section id="contacto" className="contacto">

                <h2>Contactanos</h2>

                <p>Si tienes alguna duda o consulta, no dudes en contactarnos</p>

                <br />



                <div>

                <Form>

                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1" style={{textAlign: 'left'}}>

                        <Form.Label style={{color: '#f2f2f2'}}>Ingresa tu Email</Form.Label>

                        <Form.Control type="email" placeholder="email@ejemplo.com" />

                    </Form.Group>

                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1" style={{textAlign: 'left'}}>

                        <Form.Label style={{color: '#f2f2f2'}}>Dejanos tu duda, consulta o comentario</Form.Label>

                        <Form.Control as="textarea" placeholder="Escribe tu mensaje aquí..." rows={3} />

                    </Form.Group>

                    <Button variant="primary" size="lg" type="submit" className="w-100 px-4 py-2 btn-center" style={{marginBottom: '20px'}} >
                        Enviar
                    </Button>

                </Form>
                </div>



                <p>Teléfono: 123-456-7890</p>

                <p>Email: info@concesionaria.com</p>

                <p>Dirección: Av. Principal 123, Ciudad, País</p>

            </section>

        </div>

    );

}



export default LandingPage;

