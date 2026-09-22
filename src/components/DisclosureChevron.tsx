import { Icon } from '@iconify/react';
import chevronDownIcon from '@iconify-icons/lucide/chevron-down';

export function DisclosureChevron() {
  return <span className="disclosure-chevron t-acc-chevron" aria-hidden="true"><Icon icon={chevronDownIcon} width="20" height="20" /></span>;
}
