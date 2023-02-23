import * as React from "react";
import styles from "../Styles/Navbar.module.css";

const Navbar: React.FC = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li className={`${styles.navLeft}`}><a href="/" className={styles.navLink}>Home</a></li>
        <li className={`${styles.navRight}`}><a href="https://github.com/your-github-username/your-repository-name" className={styles.navLink}>Github</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;