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
  const { children, variant = 'primary', className = '' } = props;
  const classes = `button button--${variant} ${className}`;
  if ('to' in props && props.to) {
    const { to, ...linkProps } = props;
    return (
      <Link to={to} className={classes} {...linkProps}>
        <span>{children}</span><span className="button__arrow" aria-hidden="true">↗</span>
      </Link>
    );
  }
  const { type = 'button', ...buttonProps } = props as ButtonActionProps;
  return (
    <button type={type} className={classes} {...buttonProps}>
      <span>{children}</span><span className="button__arrow" aria-hidden="true">↗</span>
    </button>
  );
}
