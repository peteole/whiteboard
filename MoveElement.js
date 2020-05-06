class MoveElement extends Operation{
    /**
     * 
     * @param {Point} move move relative to last position
     * @param {OperationOptions} options 
     */
    constructor(move,options){
        super(options);
        this.move=move;
    }
    do(){
        const sw=this.subject.touchController;
        const newPos={x:this.subject.position.x+this.move.x,y:this.subject.position.y+this.move.y};
        sw.moveElementWithoutTouch(newPos,false);
        this.subject.position=newPos;
        this.subject.draw();
        this.options.executed=true;
    }
    undo(){
        const sw=this.subject.touchController;
        const newPos={x:this.subject.position.x-this.move.x,y:this.subject.position.y-this.move.y};
        sw.moveElementWithoutTouch(newPos,false);
        this.subject.position=newPos;
        this.subject.draw();
        this.options.executed=true;
    }
    toString(){
        return JSON.stringify({
            options:this.options,
            value:this.move.x+"|"+this.move.y,
            type:"MoveElement"
        })
    }
    static fromString(value,options){
        const split=value.split("|");
        return new MoveElement({x:parseFloat(split[0]),y:parseFloat(split[1])},options);
    }
}