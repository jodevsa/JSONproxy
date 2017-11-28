const EventEmitter = require('events');
class JSONProxy {
  constructor(_storeType, parentName,_emitter) {
    if(arguments.length==0){
      this.emitter=new EventEmitter();
    }
    else{

      this.emitter=_emitter;
    }

    this.storeType = _storeType;
    this.parentArray = parentName || [];

    this.store = this.storeType === 'json'
      ? {}
      : [];
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.p = new Proxy(this.store, {
      set: this.set,
      get: this.get.bind(this)
    });
  //  this.p.emitter=this.emitter;

    return {obj:this.p,emitter:this.emitter};


  }
  handler() {
    return {set: this.set, get: this.get};
  }

  set(target, name, value) {
    const storeType = this.storeType;
    const parentArray = this.parentArray;
    const reference_array = (storeType === 'json' || isNaN(name))
      ? parentArray.concat(name)
      : parentArray.concat("array(" + name + ")");
    //console.log('detected Change', 'parent.' + reference_array.join('.'), value);

    if (Object.keys(value).length === 0 && value.constructor === Object) {
      const p=new JSONProxy('json', reference_array,this.emitter);
      target[name] =p.obj;
      p.emitter.emit('change',reference_array,value);
    } else if (Array.isArray(value)) {
      const p=new JSONProxy('array', reference_array,this.emitter);
      p.emitter.emit('change',reference_array,value)
      target[name] = p.obj;
         // target[name].emitter.on('change', this.emit);
      //    target[name].push.apply(target[name], value);
    } else {
      target[name] = value;
      this.emitter.emit('change', reference_array,value);
    }
    return true;
  }

  get(target, name) {
    return target[name];
  }

}


json = new JSONProxy();

json.emitter.on('change',function(ref,value){

  console.log("parent."+ref.join('.'),":",value);

})
module.exports=JSONProxy;
