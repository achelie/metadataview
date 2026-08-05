import { Icon } from '@iconify/react';
import scan from '@iconify-icons/lucide/scan-search';
import shield from '@iconify-icons/lucide/shield-check';
import eraser from '@iconify-icons/lucide/eraser';
import wand from '@iconify-icons/lucide/wand-2';
import badge from '@iconify-icons/lucide/badge-check';
import fileImage from '@iconify-icons/lucide/file-image';
import fileText from '@iconify-icons/lucide/file-text';
import film from '@iconify-icons/lucide/film';
import audio from '@iconify-icons/lucide/music';
import workflow from '@iconify-icons/lucide/workflow';
import lock from '@iconify-icons/lucide/lock-keyhole';
import arrow from '@iconify-icons/lucide/arrow-up-right';

const icons = { scan, shield, eraser, wand, badge, fileImage, fileText, film, audio, workflow, lock, arrow };
export type IconName = keyof typeof icons;

export function IconGlyph({ name, size = 24 }: { name: IconName; size?: number }) {
  return <Icon icon={icons[name]} width={size} height={size} aria-hidden="true" />;
}
