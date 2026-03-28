export interface CampaignObject {
  id: string;
  name: string;
  desc: string;
  bigDesc: string;
  allUnlocked: boolean;
  mapPositions: MapPositions[];
  unlockGate: UnlockGate[];
  mapHeight: number;
  backgroundAlpha: number;
  lightColor: {
    r: number;
    g: number;
    b: number;
  };
  nodes?: MapNode[];
  credits: Credits;
}

export interface MapPositions {
  childNodes: number[];
  x: number;
  y: number;
  scale: number;
  nodeOutlineLocation: string;
  nodeBackgroundLocation: string;
  letterPortion: string;
  numberPortion: number;
}

export interface UnlockGate {}

export interface MapNode {
  name: string;
  songid: string;
  customDownloadURL: string;
  characteristic: string;
  difficulty: number;
  modifiers: MapModifiers;
  requirements: MapRequirement[];
  externalModifiers: {};
  challengeInfo: string | null;
  unlockableItems: string[];
  unlockMap: boolean;
  allowStandardLevel: boolean;
}

export interface MapModifiers {
  fastNotes: boolean;
  songSpeed: number;
  noBombs: boolean;
  disappearingArrows: boolean;
  strictAngles: boolean;
  noObstacles: boolean;
  batteryEnergy: boolean;
  failOnSaberClash: boolean;
  instaFail: boolean;
  noFail: boolean;
  noArrows: boolean;
  ghostNotes: boolean;
  energyType: number;
  enabledObstacleType: number;
  speedMul: number;
}

export interface MapRequirement {
  isMax: boolean;
  type: string;
  count: number;
}

export interface Credits {
  name: string;
  credits: (CreditHeader | CreditTitle)[];
}

export interface CreditHeader {
  header: {
    name: string;
    titles: CreditTitle[];
  };
}

export interface CreditTitle {
  title: {
    name: string;
    people: string[];
  };
}
