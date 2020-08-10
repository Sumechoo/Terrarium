import { Dot } from "../types";
import { Terrarium } from "./Terrarium";
import { TERRARIUM_SIZE } from "../constants";

export interface CreatureProps {
  position: Dot;
  skin?: string;
  size: number;
  instructions?: number[];
}

export class Creature {
  private _tick = 0;
  private _angle = 0;
  private _instructionSet: number[] = [];
  private _props: CreatureProps;
  private _terrariumRef: Terrarium;

  constructor(props: CreatureProps, terrarium: Terrarium) {
    this._props = props;
    this._terrariumRef = terrarium;

    const amount = 64;

    for (let i = 0; i < amount; i++) {
      this._instructionSet.push(Math.floor(Math.random() * 15));
    }

    if (props.instructions) {
      this._instructionSet = props.instructions;
    }

    this._props.skin =
      props.skin || "#" + ((Math.random() * 0xffffff) << 0).toString(16);
  }

  public getProps(noUpdate = false) {
    if (!noUpdate) {
      this.update();
    }

    return this._props;
  }

  private update() {
    const tick = this._tick % this._instructionSet.length;
    const instruction = this._instructionSet[tick];

    this.doInstruction(instruction);

    if (this._props.position.x > TERRARIUM_SIZE.x) this._props.position.x = 0;
    if (this._props.position.x < 0) this._props.position.x = TERRARIUM_SIZE.x;

    if (this._props.position.y > TERRARIUM_SIZE.y) this._props.position.y = 0;
    if (this._props.position.y < 0) this._props.position.y = TERRARIUM_SIZE.y;
  }

  private turnLeft() {
    this._angle = this._angle - 1 < 0 ? 4 : this._angle - 1;
  }

  private turnRight() {
    this._angle = this._angle + 1 > 4 ? 0 : this._angle + 1;
  }

  private goForward() {
    switch (this._angle) {
      case 0:
        this._props.position.x += 1;
        break;
      case 2:
        this._props.position.x -= 1;
        break;
      case 1:
        this._props.position.y += 1;
        break;
      case 3:
        this._props.position.y -= 1;
        break;
    }
  }

  public kill() {
    this._terrariumRef.removeCreature(this);
  }

  private onCount(
    instruction: (found: Array<Creature>) => void,
    count = 1,
    radius = 1
  ) {
    const found = this._terrariumRef.getNearest(
      this._props.position,
      this,
      radius
    );

    if (found.length >= count) {
      instruction(found);
    }
  }

  private onLess(instruction: () => void, count = 1, radius = 1) {
    const found = this._terrariumRef.getNearest(
      this._props.position,
      this,
      radius
    );

    if (found.length < count) {
      instruction();
    }
  }

  private split(shift: Dot = { x: 3, y: 0 }, doReverse = false) {
    const size = this._props?.size;
    if (size > 2) {
      const halfSize = size / 2;
      this.kill();
      this._terrariumRef.addCreature(
        new Creature(
          {
            ...this._props,
            position: {
              x: this._props.position.x + shift.x,
              y: this._props.position.y + shift.y
            },
            size: halfSize,
            instructions: this._instructionSet
          },
          this._terrariumRef
        )
      );

      const mutatedInstructions = [...this._instructionSet];

      if (doReverse) {
        mutatedInstructions.reverse();
      }

      if (Math.random() > 0.8) {
        mutatedInstructions[
          Math.floor(Math.random() * mutatedInstructions.length)
        ] = Math.floor(Math.random() * 16);
      }

      this._terrariumRef.addCreature(
        new Creature(
          {
            ...this._props,
            size: halfSize,
            instructions: mutatedInstructions
          },
          this._terrariumRef
        )
      );
    }

    this._tick += 4;
  }

  private doInstruction(instruction: number) {
    this._tick++;

    if (this._tick % 40 === 0) {
      this._props.size--;
    }

    if (this._props.size <= 0 || this._props.size > 10) {
      this.kill();
    }

    switch (instruction) {
      case 1:
        this.goForward();
        break;
      case 2:
        this.turnLeft();
        break;
      case 3:
        this.turnRight();
        break;
      case 4:
        this.onCount(
          (found) => {
            const target = found[0];
            target.kill();
            this._props.size += target._props.size;
          },
          1,
          2
        );
        break;
      case 5:
        this.turnLeft();
        this.turnLeft();
        this.goForward();
        break;
      case 6:
        if (this._props.size < 5) {
          this._props.size++;
          this._tick += 4;
        }
        break;
      case 7:
        this.onLess(() => this.split({ y: -3, x: 0 }), 3, 3);
        break;
      case 8:
        this.onLess(() => this.split({ y: 3, x: 0 }), 3, 3);
        break;
      case 9:
        this.onLess(() => this.split({ y: 0, x: 3 }), 3, 3);
        break;
      case 10:
        this.onLess(() => this.split({ y: 0, x: -3 }), 3, 3);
        break;
    }
  }
}
