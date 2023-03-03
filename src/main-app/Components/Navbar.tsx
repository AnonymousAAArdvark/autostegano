import * as React from "react";
import { FaGithub } from "react-icons/fa"
import styles from "../Styles/Navbar.module.css";

const Navbar: React.FC = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li className={`${styles.navLeft}`}>
          <a href="/" className={styles.navLink}>
            <img src="autosteganologo.png" className={styles.logo}/>
            <p className={styles.logo_text}><span>Auto</span>Stegano</p>
          </a>
        </li>
        <li className={`${styles.navRight}`}>
          <a href="https://github.com/anonymousaaaardvark/autostegano" target={"_blank"} className={styles.navLink}>
            <FaGithub className={styles.github_icon}/>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;