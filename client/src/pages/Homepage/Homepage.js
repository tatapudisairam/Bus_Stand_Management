import React, { useState } from "react";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faRightToBracket, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import './Homepage.css';
import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";

const Homepage = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = index => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div>
            <Navbar />

            <main>
                <section className="main-container">
                    <div className="main-container-contain">
                        <p className="title">Bus Stand Employee and Route Management</p>
                        <p className="description">Streamline employee profiles, bus route assignments, and operations at bus stands for improved efficiency and smooth management.</p>

                        <div className="btn-main">
                            <a href="/employee-login">Employee</a>
                            <a href="/userlogin" className="loginlogout">User</a>
                        </div>
                    </div>
                </section>

                <section className="container">
                    <h1 className="acc-title">Frequently Asked Questions</h1>
                    <div className="accordion">
                        {['What is the purpose of the Bus Stand Employee Management System?', 'Who can access the system?', 'How does a Bus Stand Incharge manage employees?', 'What can employees do on the platform?', 'What is the role of the Main Admin?', 'Can a Bus Stand Incharge assign routes to employees?'].map((title, index) => (
                            <div className={`accordion-item ${activeIndex === index ? 'active' : ''}`} key={index}>
                                <div className="accordion-header" onClick={() => toggleAccordion(index)}>
                                    <span className="accordion-title">{title}</span>
                                    <span className={`accordion-icon ${activeIndex === index ? 'active' : ''}`}></span>
                                </div>
                                <div className={`accordion-content ${activeIndex === index ? 'active' : ''}`}>
                                    <div className="accordion-body">
                                        {index === 0 && "The system is designed to help manage the employees at bus stands efficiently. It allows bus stand incharges to create and manage employee profiles (drivers, helpers, etc.), assign bus routes, add buses to their stand, and track the history of routes and bus assignments. It also provides employees with a personal login to manage their profile and view their routes."}
                                        {index === 1 && "The system is accessed by three main types of users: the Main Admin, Bus Stand Incharges, and Employees. The Main Admin has full control over the system, including the ability to create new bus stand incharges. The Bus Stand Incharge manages employees within their assigned bus stand, handling tasks such as assigning routes and overseeing bus operations. Employees, including drivers and helpers, have limited access to their profiles, routes, and work history."}
                                        {index === 2 && "A Bus Stand Incharge has the ability to create and manage employee profiles for drivers, helpers, and other staff at the bus stand. They can edit employee details such as contact information and job role. Additionally, they assign bus routes to employees and are responsible for monitoring the work history of all employees at their bus stand. The incharge can also view the entire list of employees working at their bus stand and manage any necessary updates to their profiles."}
                                        {index === 3 && "Employees can log in to the system to view their personal profiles, check the routes they have been assigned, and update their contact information or other profile details. They can also access their work history to see the routes they have been assigned in the past, helping them track their work progress and assignments over time."}
                                        {index === 4 && "The Main Admin is responsible for the overall management of the system, with the highest level of access and control. They can create new bus stand incharges, assign them to specific bus stands, and monitor the performance of both incharges and employees across all bus stands. The Main Admin can ensure the smooth functioning of the entire system by overseeing and managing all user roles and permissions."}
                                        {index === 5 && "Yes, the Bus Stand Incharge has the authority to assign specific bus routes to employees. They can monitor and manage these assignments to ensure that each employee knows their daily tasks and responsibilities. The incharge can also access details about any employee's current or past route assignments at any time."}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Homepage;
