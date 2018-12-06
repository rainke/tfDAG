let id = 0;
export class Operator {
    public next: Operator[] = [];
    public selected = false; // 是否选中
    public id = id++;
    public width = 100;
    public height = 100;
    public drawTo = {x: 0, y: 0};
    constructor(public x = 0, public y = 0) {}
}

// tslint:disable-next-line:max-classes-per-file
class Link {

}

