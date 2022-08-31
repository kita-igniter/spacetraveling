import Image from "next/image";
import Link from "next/link";
import styles from "../../styles/common.module.scss";
import style from "./header.module.scss";

export default function Header() {
  return (
    <div className={styles.container}>
      <header className={style.header}>
        <Link href="/">
          <a>
            <Image 
              src="/images/logo-spacetraveling.svg"
              alt="logo"
              width="auto"
              height="auto"
            />
          </a>
        </Link>
      </header>
    </div>
  );
}
