import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';

interface Emoji {
  name: string;
  emoji: string;
}

const FRUITS: Emoji[] = [
  { name: 'tfa7a', emoji: '🍎' },
  { name: 'banan', emoji: '🍌' },
  { name: 'limoun', emoji: '🍊' },
  { name: '7ameda', emoji: '🍋' },
  { name: 'frez', emoji: '🍓' },
  { name: '3neb', emoji: '🍇' },
  { name: 'della7', emoji: '🍉' },
  { name: 'swihla', emoji: '🍈' },
  { name: 'khokh', emoji: '🍑' },
  { name: '7abb el melouk', emoji: '🍒' },
  { name: 'ananas', emoji: '🍍' },
  { name: 'manga', emoji: '🥭' },
  { name: 'kiwi', emoji: '🥝' },
  { name: 'bou3wid', emoji: '🍐' },
  { name: 'barqoq', emoji: '🫐' },
  { name: 'kermouss', emoji: '🫒' },
  { name: 'avoca', emoji: '🥑' },
  { name: 'koko', emoji: '🥥' },
  { name: 'tmer', emoji: '🌴' }
];

const ANIMALS: Emoji[] = [
  { name: '9erd', emoji: '🐒' },
  { name: 'kelb', emoji: '🐶' },
  { name: 'dib', emoji: '🐺' },
  { name: 'mesh', emoji: '🐱' },
  { name: 'nmer', emoji: '🐅' },
  { name: 'fa8d', emoji: '🐆' },
  { name: '3awd', emoji: '🐎' },
  { name: 'tour', emoji: '🐂' },
  { name: 'begra', emoji: '🐄' },
  { name: '7ellouf', emoji: '🐷' },
  { name: 'khenzir', emoji: '🐗' },
  { name: '7awli', emoji: '🐏' },
  { name: 'khrof', emoji: '🐑' },
  { name: 'me3za', emoji: '🐐' },
  { name: 'jmel', emoji: '🐪' },
  { name: 'fil', emoji: '🐘' },
  { name: 'far', emoji: '🐭' },
  { name: 'Tobba', emoji: '🐀' },
  { name: '9nia', emoji: '🐰' },
  { name: 'doub', emoji: '🐻' },
  { name: 'kowala', emoji: '🐨' },
  { name: 'panda', emoji: '🐼' },
  { name: 'djaja', emoji: '🐓' },
  { name: 'fellous', emoji: '🐥' },
  { name: 'bTri9', emoji: '🐧' },
  { name: 'jrana', emoji: '🐸' },
  { name: 'timsa7', emoji: '🐊' },
  { name: 'fekroun', emoji: '🐢' },
  { name: '7ensh', emoji: '🐍' },
  { name: 'tinnin', emoji: '🐉' },
  { name: 'labalen', emoji: '🐳' },
  { name: 'dlfine', emoji: '🐬' },
  { name: '7outa', emoji: '🐟' },
  { name: 'RoTala', emoji: '🐙' },
  { name: 'kokiaj', emoji: '🐚' },
  { name: 'boubbousha', emoji: '🐌' },
  { name: 'douda', emoji: '🐛' },
  { name: 'nemla', emoji: '🐜' },
  { name: 'ne7la', emoji: '🐝' },
  { name: 'koksinil', emoji: '🐞' }
];

const FOOD: Emoji[] = [
  { name: 'pizza', emoji: '🍕' },
  { name: 'pasta', emoji: '🍝' },
  { name: 'hamburger', emoji: '🍔' },
  { name: 'sushi', emoji: '🍣' },
  { name: 'cake', emoji: '🍰' },
  { name: 'salad', emoji: '🥗' },
  { name: 'burrito', emoji: '🌯' },
  { name: 'coffee', emoji: '☕' },
  { name: 'tea', emoji: '🍵' },
  { name: 'ice cream', emoji: '🍦' }
];

const VEHICLES: Emoji[] = [
  { name: 'car', emoji: '🚗' },
  { name: 'bus', emoji: '🚌' },
  { name: 'truck', emoji: '🚚' },
  { name: 'motorcycle', emoji: '🏍️' },
  { name: 'bicycle', emoji: '🚲' },
  { name: 'airplane', emoji: '✈️' },
  { name: 'train', emoji: '🚆' },
  { name: 'boat', emoji: '⛵' },
  { name: 'rocket', emoji: '🚀' },
  { name: 'ambulance', emoji: '🚑' }
];

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-generic',
  styleUrl: './generic.css',
  templateUrl: './generic.html',
})
export class GenericComponent {
  genVect: Emoji[] = [];

  constructor(private readonly route: ActivatedRoute) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const uriParam = params.get('id');
      console.log(uriParam);

      if (uriParam === 'fruits') {
        this.genVect = FRUITS;
      } else if (uriParam === 'animals') {
        this.genVect = ANIMALS;
      } else if (uriParam === 'food') {
        this.genVect = FOOD;
      } else if (uriParam === 'vehicles') {
        this.genVect = VEHICLES;
      } else {
        this.genVect = [];
      }
    });
  }
}


