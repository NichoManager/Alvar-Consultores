import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type CommonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'light' | 'text';
  className?: string;
};

type ButtonLinkProps = CommonProps & { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;
type ButtonActionProps = CommonProps & { to?: never } & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: ButtonLinkProps | ButtonActionProps) {
  if ('to' in props && props.to) {
    const { to, children, variant = 'primary', className = '', ...linkProps } = props;
    const classes = ['button', `button--${variant}`, className].filter(Boolean).join(' ');
    return (
      <Link to={to} className={classes} {...linkProps}>
        <span>{children}</span><span className="button__arrow" aria-hidden="true">↗</span>
      </Link>
    );
  }
  const { children, variant = 'primary', className = '', type = 'button', ...buttonProps } = props as ButtonActionProps;
  const classes = ['button', `button--${variant}`, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} {...buttonProps}>
      <span>{children}</span><span className="button__arrow" aria-hidden="true">↗</span>
    </button>
  );
}
