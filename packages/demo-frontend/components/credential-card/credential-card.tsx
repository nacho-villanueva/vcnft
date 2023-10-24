import styles from './credential-card.module.scss';

/* eslint-disable-next-line */
export interface CredentialCardProps {}

export function CredentialCard(props: CredentialCardProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to CredentialCard!</h1>
    </div>
  );
}

export default CredentialCard;
