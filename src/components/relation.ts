let id = 0;
export class Operator {
    public next: Operator[] = [];
    public id = id++;
    public x = 0;
    public y = 0;
    public width = 100;
    public height = 100;
    public drawTo = {x: 0, y: 0};
    constructor(x = 0) {
        this.x = x;
    }
}

// tslint:disable-next-line:max-classes-per-file
class Link {

}

