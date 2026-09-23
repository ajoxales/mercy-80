import backgroundMusic from "./assets/Romantic Happy Birthday (Arranged by Miranda Wong) Piano Cover.mp3";
import endingVideo from "./assets/ending video.mp4";
import image1 from "./assets/image1.jpg";
import image2 from "./assets/image2.jpg";
import voice1 from "./assets/voice1.mp3";
import voice2 from "./assets/voice2.wav";

export const backgroundMusicUrl: string = backgroundMusic;
export const backgroundMusicVolume = 0.15;

export interface LetterContent {
  id: string;
  sender: string;
  relationship: string;
  photoCaption: string;
  salutation: string;
  message: string;
  signature: string;
  photoUrl: string;
  audioUrl: string;
}

export interface KeepsakeContent {
  celebrant: string;
  fullName: string;
  closingName: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  letters: [LetterContent, LetterContent];
  finaleTitle: string;
  finaleMessage: string;
  videoUrl: string;
}

export const defaultContent: KeepsakeContent = {
  celebrant: "Mercedes",
  fullName: "Mercedes Oxales",
  closingName: "Lola Mercy",
  eyebrow: "A celebration of a beautiful life",
  title: "Mercedes @ 80",
  subtitle: "Letters, voices, and love from Dondon and Kate",
  letters: [
    {
      id: "letter-one",
      sender: "Dondon",
      relationship: "Your loving son",
      photoCaption: "Dondon",
      salutation: "Happy Birthday, Ma! 🎂❤️",
      message:
        "Sa espesyal na araw mo, gusto ko lang sabihin kung gaano ako ka-grateful sa lahat ng ginawa at patuloy mong ginagawa para sa aming pamilya. Maraming sakripisyo ang ginawa mo para sa amin, mga bagay na hindi ko man palaging nasasabi o naipapakita, pero lubos kong pinapahalagahan.\n\nAlam kong may mga responsibilidad bilang magulang na hindi namin palaging nagagampanan, lalo na kay Fourth, pero nandiyan ka para tumulong at umalalay sa amin. Hindi mo kami kailanman pinabayaan at lagi mong inuuna ang kapakanan ng pamilya.\n\nMa, maraming salamat sa iyong walang sawang pagmamahal, pag-unawa, at sakripisyo. Hindi namin kayang tumbasan ang lahat ng ginawa mo para sa amin, pero sana alam mong hindi namin iyon nakakalimutan at habambuhay naming pahahalagahan. ❤️\n\nDalangin ko na bigyan ka pa ni Lord ng mahabang buhay, mabuting kalusugan, at maraming masasayang araw kasama ang mga taong nagmamahal sa iyo.\n\nMahal na mahal kita, Ma. Salamat sa pagiging isang mabuting ina at sa lahat ng ginagawa mo para sa aming pamilya. ❤️🙏\n\nHappy Birthday, Ma! Enjoy your special day! 🎂🎉💐",
      signature: "Your loving son,\nDondon",
      photoUrl: image1,
      audioUrl: voice1,
    },
    {
      id: "letter-two",
      sender: "Kate",
      relationship: "Your daughter-in-law",
      photoCaption: "Kate & Ma",
      salutation: "Maligayang Birthday, Ma! 🎂❤️",
      message:
        "Ngayong 80th birthday mo, gusto ko pong ipaabot ang aking taos-pusong pasasalamat sa inyo, hindi lamang bilang Mama ni Dondon, kundi bilang isang biyenang naging malaking bahagi na rin ng buhay ko at ng pamilya namin.\n\nMaraming salamat po sa pagtanggap ninyo sa akin bilang bahagi ng pamilya at sa lahat ng pag-unawa at pagmamahal na ipinakita ninyo sa akin sa mga panahong hindi naging madali ang buhay namin.\n\nLalo na noong mga panahong nagda-dialysis ako. Kahit umuuwi kami ng Pilipinas para sana makasama at maalagaan si Fourth, may mga pagkakataong hindi ko pa rin kayang gampanan nang buo ang mga responsibilidad ko bilang magulang dahil sa aking kalagayan. Hindi naging madali para sa akin iyon bilang isang ina, pero malaking bagay po na hindi ninyo ako hinusgahan o pinaramdam na nagkukulang ako.\n\nSa halip, naintindihan ninyo ang sitwasyon ko at kayo ang tumulong na punan ang mga bagay na hindi ko kayang gawin noon. Kayo ang naging katuwang namin sa pagpapalaki kay Fourth at nagbigay sa kanya ng pagmamahal, pag-aalaga at gabay habang hindi ko pa kayang gawin ang lahat para sa kanya. ❤️\n\nHindi ko po makakalimutan ang mga sandaling nasa loob ako ng kwarto, nagda-dialysis at maluha-luha habang pinagmamasdan ko kayong inaasikaso si Fourth sa paghahanda niya at pagpasok sa eskwela. Sa mga panahong iyon, ramdam ko kung gaano kalaki ang tulong at pagmamahal na ibinibigay ninyo sa kanya at sa amin. Kahit hindi ko man po nasasabi palagi, labis-labis ang pasasalamat ko sa inyo.\n\nHindi ko po makakalimutan ang lahat ng oras, pagod at pagmamahal na ibinigay ninyo kay Fourth. Malaki po ang naging bahagi ninyo sa kanyang paglaki at sa taong siya ngayon.\n\nMaraming salamat din po dahil naging mabuti kayong ina sa asawa ko. Sa pagpapalaki ninyo sa kanya, nabuo ang taong nakasama ko sa buhay at naging mabuting asawa at ama kay Fourth. Kaya sa maraming bagay na ipinagpapasalamat ko sa buhay, isa po kayo sa mga iyon. ❤️\n\nHindi po namin makakalimutan ang lahat ng ginawa ninyo para sa amin, at habang buhay naming dadalhin ang pasasalamat at pagmamahal namin sa inyo. ❤️\n\nDasal ko na patuloy pa kayong bigyan ni Lord ng malusog, mahaba at masayang buhay. Sana marami pa tayong birthdays, celebrations at masasayang alaala na pagsasaluhan bilang isang pamilya. 🙏❤️\n\nHappy Birthday, Mama! 🎂💐\n\nMaraming salamat po sa pagiging isang mabuting ina, lola, at biyenan sa amin.\n\nMahal na mahal po namin kayo. ❤️",
      signature: "Love,\nKate",
      photoUrl: image2,
      audioUrl: voice2,
    },
  ],
  finaleTitle: "With all our love, always",
  finaleMessage: "One last surprise for you, Ma.",
  videoUrl: endingVideo,
};
