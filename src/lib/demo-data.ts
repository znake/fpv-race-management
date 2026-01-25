import type { Pilot } from './schemas'

export const DEMO_PILOTS: Pilot[] = [
  {
    id: "208f18b5-6c08-4c34-8149-96fe5300d64a",
    name: "TomL FPV",
    imageUrl: "https://i.imgur.com/vi4o2xB.jpeg",
    instagramHandle: "@tomlfpv"
  },
  {
    id: "ffbfe80f-3df2-4503-8d35-d52c73c3abe2",
    name: "Jakob FPV",
    imageUrl: "https://i.imgur.com/MX8Umyz.jpeg",
    instagramHandle: "@jakob.fpv"
  },
  {
    id: "8db2cfeb-fb72-4777-a663-ed5d1e6f9a8d",
    name: "Zink (Max)",
    imageUrl: "https://i.imgur.com/JDaIdjS.jpeg",
    instagramHandle: "@zink__mckenna"
  },
  {
    id: "5bf5fd28-437e-4698-a9be-9be189788ef0",
    name: "Markus W",
    imageUrl: "https://i.imgur.com/g1Uo9Xj.jpeg"
  },
  {
    id: "68eed5e8-d8fe-45fe-9112-dbc187544bc4",
    name: "berni fpv",
    imageUrl: "https://i.imgur.com/VdgonC0.jpeg",
    instagramHandle: "@bernifpv"
  },
  {
    id: "2641b9c5-d3e8-4225-82aa-4b75c3a74ff7",
    name: "hube fpv",
    imageUrl: "https://i.imgur.com/K84q1tA.jpeg",
    instagramHandle: "@bernhardhuss"
  },
  {
    id: "00466f37-0c67-4a9a-8c80-3e3312e7c5f2",
    name: "Emil Dumm",
    imageUrl: "https://i.imgur.com/PUeSRpd.jpeg",
    instagramHandle: "@emil.isgr"
  },
  {
    id: "2f20349a-3f76-422f-b0f9-efd103d62efe",
    name: "re fpv",
    imageUrl: "https://i.imgur.com/tCdIfiJ.jpeg",
    instagramHandle: "@re.fpv"
  },
  {
    id: "56cb19fd-2528-4cd8-9bb5-3b6c6431e54a",
    name: "theodor fpv",
    imageUrl: "https://i.imgur.com/zNsEvnk.jpeg",
    instagramHandle: "@theodor.fpv"
  },
  {
    id: "748b1e71-3420-4e23-be9d-2ef33d7ff86c",
    name: "Jürgen Stangl",
    imageUrl: "https://i.imgur.com/Y5cqjXU.jpeg",
    instagramHandle: "@tingltanglfpv"
  },
  {
    id: "8cdab049-f45d-42d1-bcf2-4a87ddb36367",
    name: "Nicholas Meschke",
    imageUrl: "https://i.imgur.com/aYmM2tA.jpeg",
    instagramHandle: "@nixsm_"
  },
  {
    id: "ca23d4e7-4fc5-49cb-9621-e26d290fb8fb",
    name: "Christoph",
    imageUrl: "https://i.imgur.com/ygfAdnv.png"
  },
  {
    id: "a6b0d14c-11a1-4359-9d1e-337ac6302267",
    name: "benstone fpv",
    imageUrl: "https://i.imgur.com/mZMCaLV.jpeg",
    instagramHandle: "@benstonefpv"
  },
  {
    id: "9445fb05-ea0b-4b93-9cc5-d02683dddda6",
    name: "nofear23m",
    imageUrl: "https://i.imgur.com/7YIcNZn.png"
  },
  {
    id: "97c58a29-0f58-48d8-8d23-fe7a499d156b",
    name: "Leonhard",
    imageUrl: "https://i.imgur.com/cyIN6Fk.png"
  },
  {
    id: "8b538383-7ed5-4c5f-bff5-37d3b83d1ea3",
    name: "NullNullZeroFPV",
    imageUrl: "https://i.imgur.com/GZTfIWI.png"
  }
]

export function loadDemoPilots(): void {
  const STORAGE_KEY = 'tournament-storage'
  
  const demoState = {
    state: {
      pilots: DEMO_PILOTS,
      tournamentStarted: false,
      tournamentPhase: 'setup',
      heats: [],
      currentHeatIndex: 0,
      winnerPilots: [],
      loserPilots: [],
      eliminatedPilots: [],
      loserPool: [],
      grandFinalePool: [],
      isQualificationComplete: false,
      isWBFinaleComplete: false,
      isLBFinaleComplete: false,
      isGrandFinaleComplete: false,
      lastCompletedBracketType: null,
      currentWBRound: 0,
      currentLBRound: 0,
      lbRoundWaitingForWB: false,
      pilotBracketStates: {},
      rematchHeats: [],
      grandFinaleRematchPending: false
    },
    version: 0
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoState))
  window.location.reload()
}
