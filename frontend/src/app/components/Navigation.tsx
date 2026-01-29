'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>📚</span>
          Knowledge Platform
        </Link>
        
        <div className={styles.links}>
          <Link 
            href="/sessions" 
            className={isActive('/sessions') ? styles.activeLink : styles.link}
          >
            Sessions
          </Link>
          <Link 
            href="/experts" 
            className={isActive('/experts') ? styles.activeLink : styles.link}
          >
            Experts
          </Link>
          <Link 
            href="/admin/sessions" 
            className={isActive('/admin') ? styles.activeLink : styles.link}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
