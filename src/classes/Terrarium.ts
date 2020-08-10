import { Dot } from "../types";
import { Creature, CreatureProps } from "./Creature";
import { TERRARIUM_SIZE } from "../constants";

const MAX_CREATURES = 2000;

export class Terrarium {
  private _ctx: CanvasRenderingContext2D;
  private _creatures: Array<Creature> = [];

  constructor(amount = MAX_CREATURES) {
    const creatures: Creature[] = [];

    for (let i = 0; i < amount; i++) {
      creatures.push(
        new Creature(
          {
            position: {
              x: Math.floor(Math.random() * TERRARIUM_SIZE.x),
              y: Math.floor(Math.random() * TERRARIUM_SIZE.y)
            },
            size: 1
          },
          this
        )
      );
    }

    this._creatures = creatures;
  }

  public doRender() {
    if (!this._ctx) {
      return;
    }

    this._ctx.clearRect(0, 0, TERRARIUM_SIZE.x, TERRARIUM_SIZE.y);

    this._creatures.forEach((creature) => {
      this.renderCreature(creature.getProps());
    });

    this._ctx.strokeStyle = "solid 1px red";
    this._ctx.stroke();
  }

  public getNearest({ x, y }: Dot, requestor: Creature, radius = 5) {
    const found: Array<Creature> = [];

    this._creatures.forEach((creature) => {
      if (creature === requestor) {
        return;
      }

      const { position } = creature.getProps(true);

      if (
        Math.abs(position.x - x) < radius &&
        Math.abs(position.y - y) < radius
      ) {
        found.push(creature);
      }
    });

    return found;
  }

  public addCreature(creature: Creature) {
    if (this._creatures.length < MAX_CREATURES) {
      this._creatures.push(creature);
    }
  }

  public removeCreature(creature: Creature) {
    const index = this._creatures.indexOf(creature);
    this._creatures.splice(index, 1);
  }

  public initRenderingContext(context: CanvasRenderingContext2D) {
    this._ctx = context;
  }

  private renderCreature({ position, skin, size }: CreatureProps) {
    this.renderDot(position, size, skin);
  }

  private renderDot({ x, y }: Dot, size: number, color: string) {
    const halfSize = size / 2;

    this._ctx.fillStyle = color;
    this._ctx.fillRect(x - halfSize, y - halfSize, halfSize, halfSize);
  }
}
