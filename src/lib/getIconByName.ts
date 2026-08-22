import {
  FaCircleInfo,
  FaCircleUser,
  FaComment,
  FaFlagCheckered,
  FaGraduationCap,
  FaMicrophone,
  FaPencil,
  FaRegPaperPlane,
  FaRobot,
  FaTriangleExclamation,
  FaVolumeXmark,
  FaXmark,
} from 'react-icons/fa6';

import de from '@/assets/icons/flags/de.svg';
import es from '@/assets/icons/flags/es.svg';
import fr from '@/assets/icons/flags/fr.svg';
import gb from '@/assets/icons/flags/gb.svg';
import it from '@/assets/icons/flags/it.svg';
import nl from '@/assets/icons/flags/nl.svg';
import no from '@/assets/icons/flags/no.svg';

const FLAG_ICONS = {
  'flag-de': de,
  'flag-gb': gb,
  'flag-it': it,
  'flag-es': es,
  'flag-fr': fr,
  'flag-nl': nl,
  'flag-no': no,
};
export type FlagIconName = keyof typeof FLAG_ICONS;

export const ICONS = {
  ...FLAG_ICONS,
  ai: FaRobot,
  cancel: FaXmark,
  chat: FaComment,
  edit: FaPencil,
  error: FaTriangleExclamation,
  evaluation: FaGraduationCap,
  finish: FaFlagCheckered,
  info: FaCircleInfo,
  microphone: FaMicrophone,
  send: FaRegPaperPlane,
  user: FaCircleUser,
  volumeMute: FaVolumeXmark,
} as const;
export type IconName = keyof typeof ICONS;

function flagIconExists(iconName: string): iconName is FlagIconName {
  return iconName in FLAG_ICONS;
}

export function getFlagIconName(languageTag: string): FlagIconName | undefined {
  const countryCode = languageTag.split('-')[1]?.toLowerCase();
  if (!countryCode) {
    return;
  }

  const iconName = `flag-${countryCode}`;
  return flagIconExists(iconName) ? iconName : undefined;
}
