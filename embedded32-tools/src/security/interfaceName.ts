/** Linux network interface name: 1-15 chars, alnum plus _-. and not starting with hyphen. */
export const LINUX_INTERFACE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,14}$/;

export class InvalidInterfaceNameError extends Error {
  constructor(name: string) {
    super(`Invalid network interface name: ${name}`);
    this.name = 'InvalidInterfaceNameError';
  }
}

/**
 * Validate a Linux network interface name before passing to child_process.
 */
export function validateLinuxInterfaceName(ifname: string): string {
  if (typeof ifname !== 'string' || !ifname) {
    throw new InvalidInterfaceNameError(String(ifname));
  }
  if (ifname.length > 15) {
    throw new InvalidInterfaceNameError(ifname);
  }
  if (/[\s/\\;|&$`<>]/.test(ifname)) {
    throw new InvalidInterfaceNameError(ifname);
  }
  if (!LINUX_INTERFACE_NAME_PATTERN.test(ifname)) {
    throw new InvalidInterfaceNameError(ifname);
  }
  return ifname;
}
