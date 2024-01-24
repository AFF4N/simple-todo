import { trigger, transition, style, animate } from "@angular/animations";

export const taskAnimations = [
  trigger('slideInOut', [
    transition(':enter', [
      style({ transform: 'translateX(-100%)', opacity: 0 }),
      animate('300ms ease-in', style({ transform: 'translateX(0)', opacity: 1 })),
    ]),
    transition(':leave', [
      style({ transform: 'translateX(0)', opacity: 1 }),
      animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 })),
    ]),
  ]),
];

export const slideTopBottom = [
  trigger('slideTopBottom', [
    transition(':enter', [
      style({ transform: 'translateY(100%)', opacity: 0 }),
      animate('300ms ease-in-out', style({ transform: 'translateY(0)', opacity: 1 })),
    ]),
    transition(':leave', [
      animate('300ms ease-in-out', style({ transform: 'translateY(100%)', opacity: 0 })),
    ]),
  ]),
];

export const deleteBtnAnimation = [
  trigger('slideFromBottom', [
    transition(':enter', [
      style({ transform: 'translateY(200%)' }),
      animate('0.3s ease-out', style({ transform: 'translateY(-20%)' })),
    ]),
    transition(':leave', [
      style({ transform: 'translateY(-20%)' }),
      animate('0.3s ease-in', style({ transform: 'translateY(200%)' })),
    ]),
  ]),
]
