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
    name: "Markus",
    imageUrl: "https://i.imgur.com/g1Uo9Xj.jpeg"
  },
  {
    id: "68eed5e8-d8fe-45fe-9112-dbc187544bc4",
    name: "berniFPV",
    imageUrl: "https://i.imgur.com/VdgonC0.jpeg",
    instagramHandle: "@bernifpv"
  },
  {
    id: "2641b9c5-d3e8-4225-82aa-4b75c3a74ff7",
    name: "hubeFpv",
    imageUrl: "https://i.imgur.com/K84q1tA.jpeg",
    instagramHandle: "@bernhardhuss"
  },
  {
    id: "00466f37-0c67-4a9a-8c80-3e3312e7c5f2",
    name: "schnemil",
    imageUrl: "https://i.imgur.com/ML9pp55.png",
    instagramHandle: "@emil.isgr"
  },
  {
    id: "2f20349a-3f76-422f-b0f9-efd103d62efe",
    name: "Andi",
    imageUrl: "https://i.imgur.com/Lb2ygJU.png"
  },
  {
    id: "56cb19fd-2528-4cd8-9bb5-3b6c6431e54a",
    name: "theodor fpv",
    imageUrl: "https://i.imgur.com/mCPoV7e.jpeg",
    instagramHandle: "@theodor.fpv"
  },
  {
    id: "748b1e71-3420-4e23-be9d-2ef33d7ff86c",
    name: "TinglTangl",
    imageUrl: "https://i.imgur.com/Y5cqjXU.jpeg",
    instagramHandle: "@tingltanglfpv"
  },
  {
    id: "8cdab049-f45d-42d1-bcf2-4a87ddb36367",
    name: "Nixsm",
    imageUrl: "https://i.imgur.com/yc3SiNd.jpeg",
    instagramHandle: "@nixsmfpv"
  },
  {
    id: "ca23d4e7-4fc5-49cb-9621-e26d290fb8fb",
    name: "Patrick Schwarz",
    imageUrl: "https://i.imgur.com/yS9BdCc.jpeg",
    instagramHandle: "@slowfly_fpv"
  },
  {
    id: "a6b0d14c-11a1-4359-9d1e-337ac6302267",
    name: "Eva FPV",
    imageUrl: "https://i.imgur.com/UTtkh5w.jpeg"
  },
  {
    id: "9445fb05-ea0b-4b93-9cc5-d02683dddda6",
    name: "Rc tec",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaU0t8pqR8VlTXiILqlNy7mhGwEgN2WMB90w&s",
    instagramHandle: "@rene.flankl"
  },
  {
    id: "97c58a29-0f58-48d8-8d23-fe7a499d156b",
    name: "Leonhard",
    imageUrl: "https://lh3.googleusercontent.com/pw/AP1GczPmHXNvLJ-oxXYl8eGOqBr2ThNykQPDtcj1tuJljlRPegNpRausy21qWJoojUtqCGhdPxaLvJRU5x0iKf4aOQKLn3oq5UsfUr96Q-7yc9f1Ib5tPwo7uZfCkWt_CxBoB1YF9fbhMeFiodrJHvH5j90lhQ=w697-h929-s-no-gm?authuser=0",
    instagramHandle: "@meister_leonhard"
  },
  {
    id: "8b538383-7ed5-4c5f-bff5-37d3b83d1ea3",
    name: "MHB FPV",
    imageUrl: "https://i.imgur.com/LFT3OVC.jpeg"
  },
  {
    id: "4774b9f8-eacf-40d9-8ccb-259a989ceb47",
    name: "lejennix_fpv",
    imageUrl: "https://i.imgur.com/C7kRiDn.jpeg"
  },
  {
    id: "72fbe112-ba44-4ad7-ae9e-215962ac6682",
    name: "x2Clemens",
    imageUrl: "https://i.imgur.com/3aoaFWi.png",
    instagramHandle: "@x2clemens"
  },
  {
    id: "e9a79202-880c-4c7b-b601-680dd50e0fee",
    name: "JOSHYY",
    imageUrl: "https://i.imgur.com/YlSphyE.jpeg",
    instagramHandle: "@joshyy_fpv"
  },
  {
    id: "ddd8f25e-1cd8-4e30-80fb-a6abad8b4d8f",
    name: "GustaFPV",
    imageUrl: "https://i.imgur.com/SiYRAjs.png",
    instagramHandle: "@gustaFPV"
  },
  {
    id: "f6a38d6b-8412-48fb-b34c-be2d74105518",
    name: "rxtx.fpv",
    imageUrl: "https://i.imgur.com/ggGEfYD.jpeg",
    instagramHandle: "@rxtx.fpv"
  },
  {
    id: "6dfc028e-81a8-4c9f-b280-bf3cd079726c",
    name: "RonV_Fpv",
    imageUrl: "https://i.imgur.com/By0dsip.jpeg"
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
      pilotBracketStates: {}
    },
    version: 0
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoState))
  window.location.reload()
}
