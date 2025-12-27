# Script Insert Dữ Liệu Mẫu vào MongoDB

Chạy script này trong NoSQL Booster hoặc MongoDB Shell để thêm dữ liệu mẫu.

## 1. Insert Users

```javascript
db.users.insertMany([
  {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    password: "123456",
    avatar: "",
    bio: "Đam mê nấu ăn và chia sẻ công thức",
    recipeCount: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Trần Thị B",
    email: "tranthib@example.com",
    password: "123456",
    avatar: "",
    bio: "Yêu thích món Việt Nam truyền thống",
    recipeCount: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Lê Văn C",
    email: "levanc@example.com",
    password: "123456",
    avatar: "",
    bio: "Chuyên gia nấu ăn healthy",
    recipeCount: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
```

## 2. Lấy User IDs

Sau khi insert users, lấy ObjectId của từng user:

```javascript
var userA = db.users.findOne({ email: "nguyenvana@example.com" });
var userB = db.users.findOne({ email: "tranthib@example.com" });
var userC = db.users.findOne({ email: "levanc@example.com" });

print("User A ID: " + userA._id);
print("User B ID: " + userB._id);
print("User C ID: " + userC._id);
```

## 3. Insert Recipes (Thay authorId bằng ID thực tế)

**Cách 1: Sử dụng biến (recommended)**

```javascript
db.recipes.insertMany([
  {
    title: "Phở Bò Truyền Thống",
    description: "Món phở bò đậm đà hương vị truyền thống Việt Nam với nước dùng được ninh trong nhiều giờ",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80",
    authorId: userA._id,
    prepTime: 30,
    cookTime: 180,
    servings: 4,
    difficulty: "medium",
    ingredients: [
      { name: "Xương bò", amount: "1", unit: "kg" },
      { name: "Thịt bò", amount: "500", unit: "g" },
      { name: "Bánh phở", amount: "500", unit: "g" }
    ],
    steps: [
      { order: 1, instruction: "Ninh xương bò trong 3 tiếng" },
      { order: 2, instruction: "Thái thịt bò mỏng" }
    ],
    category: ["Món chính", "Việt Nam"],
    tags: ["phở", "bò", "sáng"],
    likes: 245,
    views: 1520,
    cooksnaps: 89,
    createdAt: new Date("2025-10-20"),
    updatedAt: new Date("2025-10-20")
  },
  {
    title: "Bánh Mì Thịt Nướng",
    description: "Bánh mì giòn rụm với nhân thịt nướng thơm lừng, rau sống tươi ngon",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    authorId: userB._id,
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    difficulty: "easy",
    ingredients: [
      { name: "Bánh mì", amount: "2", unit: "ổ" },
      { name: "Thịt heo", amount: "300", unit: "g" }
    ],
    steps: [
      { order: 1, instruction: "Ướp và nướng thịt" }
    ],
    category: ["Ăn sáng", "Việt Nam"],
    tags: ["bánh mì", "nướng"],
    likes: 189,
    views: 980,
    cooksnaps: 67,
    createdAt: new Date("2025-10-25"),
    updatedAt: new Date("2025-10-25")
  },
  {
    title: "Bún Chả Hà Nội",
    description: "Món bún chả đặc trưng của Hà Nội với chả nướng thơm phức",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
    authorId: userA._id,
    prepTime: 30,
    cookTime: 25,
    servings: 3,
    difficulty: "medium",
    ingredients: [
      { name: "Thịt ba chỉ", amount: "500", unit: "g" },
      { name: "Bún tươi", amount: "300", unit: "g" }
    ],
    steps: [
      { order: 1, instruction: "Ướp thịt với gia vị" },
      { order: 2, instruction: "Nướng chả trên bếp than" }
    ],
    category: ["Món chính", "Việt Nam"],
    tags: ["bún chả", "nướng", "hà nội"],
    likes: 312,
    views: 1890,
    cooksnaps: 124,
    createdAt: new Date("2025-10-28"),
    updatedAt: new Date("2025-10-28")
  },
  {
    title: "Gỏi Cuốn Tôm Thịt",
    description: "Gỏi cuốn tươi mát với tôm, thịt và rau sống, ăn kèm nước chấm đặc biệt",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80",
    authorId: userC._id,
    prepTime: 25,
    cookTime: 10,
    servings: 4,
    difficulty: "easy",
    ingredients: [
      { name: "Tôm", amount: "300", unit: "g" },
      { name: "Thịt heo luộc", amount: "200", unit: "g" },
      { name: "Bánh tráng", amount: "20", unit: "tờ" }
    ],
    steps: [
      { order: 1, instruction: "Luộc tôm và thịt" },
      { order: 2, instruction: "Cuốn bánh tráng với nhân" }
    ],
    category: ["Khai vị", "Việt Nam"],
    tags: ["gỏi cuốn", "tôm", "healthy"],
    likes: 156,
    views: 740,
    cooksnaps: 45,
    createdAt: new Date("2025-10-29"),
    updatedAt: new Date("2025-10-29")
  }
]);
```

## 4. Verify Data

```javascript
// Count documents
print("Total users: " + db.users.count());
print("Total recipes: " + db.recipes.count());

// View all recipes
db.recipes.find().pretty();

// View recipes with author info (lookup)
db.recipes.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "authorId",
      foreignField: "_id",
      as: "author"
    }
  },
  {
    $unwind: "$author"
  },
  {
    $project: {
      title: 1,
      "author.name": 1,
      "author.email": 1,
      likes: 1,
      views: 1
    }
  }
]);
```

## 5. Create Indexes (Optional - Recommended)

```javascript
// Index for faster queries
db.recipes.createIndex({ title: "text", description: "text", tags: "text" });
db.recipes.createIndex({ authorId: 1 });
db.recipes.createIndex({ createdAt: -1 });
db.users.createIndex({ email: 1 }, { unique: true });
```

---

## Quick Insert (One-liner)

Nếu bạn muốn insert nhanh, chạy lệnh này:

```javascript
// Insert users first
db.users.insertMany([{name:"Nguyễn Văn A",email:"nguyenvana@example.com",password:"123456",avatar:"",bio:"Đam mê nấu ăn",recipeCount:2,createdAt:new Date(),updatedAt:new Date()},{name:"Trần Thị B",email:"tranthib@example.com",password:"123456",avatar:"",bio:"Yêu thích món Việt",recipeCount:1,createdAt:new Date(),updatedAt:new Date()},{name:"Lê Văn C",email:"levanc@example.com",password:"123456",avatar:"",bio:"Chuyên gia healthy",recipeCount:1,createdAt:new Date(),updatedAt:new Date()}]);

// Get user IDs and insert recipes
var userA=db.users.findOne({email:"nguyenvana@example.com"});var userB=db.users.findOne({email:"tranthib@example.com"});var userC=db.users.findOne({email:"levanc@example.com"});db.recipes.insertMany([{title:"Phở Bò Truyền Thống",description:"Món phở bò đậm đà hương vị truyền thống Việt Nam",image:"https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80",authorId:userA._id,prepTime:30,cookTime:180,servings:4,difficulty:"medium",ingredients:[{name:"Xương bò",amount:"1",unit:"kg"},{name:"Thịt bò",amount:"500",unit:"g"},{name:"Bánh phở",amount:"500",unit:"g"}],steps:[{order:1,instruction:"Ninh xương bò trong 3 tiếng"},{order:2,instruction:"Thái thịt bò mỏng"}],category:["Món chính","Việt Nam"],tags:["phở","bò","sáng"],likes:245,views:1520,cooksnaps:89,createdAt:new Date("2025-10-20"),updatedAt:new Date("2025-10-20")},{title:"Bánh Mì Thịt Nướng",description:"Bánh mì giòn rụm với nhân thịt nướng thơm lừng",image:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",authorId:userB._id,prepTime:20,cookTime:15,servings:2,difficulty:"easy",ingredients:[{name:"Bánh mì",amount:"2",unit:"ổ"},{name:"Thịt heo",amount:"300",unit:"g"}],steps:[{order:1,instruction:"Ướp và nướng thịt"}],category:["Ăn sáng","Việt Nam"],tags:["bánh mì","nướng"],likes:189,views:980,cooksnaps:67,createdAt:new Date("2025-10-25"),updatedAt:new Date("2025-10-25")},{title:"Bún Chả Hà Nội",description:"Món bún chả đặc trưng của Hà Nội",image:"https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",authorId:userA._id,prepTime:30,cookTime:25,servings:3,difficulty:"medium",ingredients:[{name:"Thịt ba chỉ",amount:"500",unit:"g"},{name:"Bún tươi",amount:"300",unit:"g"}],steps:[{order:1,instruction:"Ướp thịt với gia vị"},{order:2,instruction:"Nướng chả trên bếp than"}],category:["Món chính","Việt Nam"],tags:["bún chả","nướng","hà nội"],likes:312,views:1890,cooksnaps:124,createdAt:new Date("2025-10-28"),updatedAt:new Date("2025-10-28")},{title:"Gỏi Cuốn Tôm Thịt",description:"Gỏi cuốn tươi mát với tôm, thịt và rau sống",image:"https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80",authorId:userC._id,prepTime:25,cookTime:10,servings:4,difficulty:"easy",ingredients:[{name:"Tôm",amount:"300",unit:"g"},{name:"Thịt heo luộc",amount:"200",unit:"g"},{name:"Bánh tráng",amount:"20",unit:"tờ"}],steps:[{order:1,instruction:"Luộc tôm và thịt"},{order:2,instruction:"Cuốn bánh tráng với nhân"}],category:["Khai vị","Việt Nam"],tags:["gỏi cuốn","tôm","healthy"],likes:156,views:740,cooksnaps:45,createdAt:new Date("2025-10-29"),updatedAt:new Date("2025-10-29")}]);
```
