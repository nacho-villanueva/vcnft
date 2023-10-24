import styles from './page.module.scss';

/* eslint-disable-next-line */
export interface GenerateProps {}

export function Generate(props: GenerateProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Generate!</h1>
    </div>
  );
}

export default Generate;
