const {Schema, model} = require('mongoose');
const userSchema = new Schema({
    email:{
        type: String,
        required:true
    },
    name:{
        type: String,
        required:true
    },
    password:{
       type:String,
       required: true 
    },
    cart:{
        items: [
            {
                count: {
                    type: Number,
                    require: true,
                    default: 0
                },
                courseId:{
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    require:true
                }
            }
        ]
    },
    avatarUrl:{
      type:String  
    },
    resetToken: {
        type:String,
    },
    resetTokenExp:{
        type:Date, 
    }
});


userSchema.methods.addToCart = function(course){
    const items = [...this.cart.items];
    const idx = items.findIndex(c => {
        return c.courseId.toString() === course._id.toString()
    });
    if(idx >= 0 ){
        items[idx].count= items[idx].count + 1;
    }else{
        items.push({
            courseId: course._id,
            count: 1
        });
    }
    // const newCart = {items:clonedItems}
    // this.cart = newCart;
    this.cart = {items};
    return this.save()
}


userSchema.methods.removeFromCart = function(id){
    let items = [...this.cart.items];
    const idx = items.findIndex((c)=>{
        return c.courseId.toString() === id.toString()
    })
    if (items[idx].count === 1){
        items = items.filter((c) => c.courseId.toString() != id.toString())

    }else{
        items[idx].count--;
    }
    this.cart = {items};
    return this.save();
}

userSchema.methods.clearCart = function(){
    this.cart = {
        items: []
    }
    this.save();
}
module.exports = model('User', userSchema);