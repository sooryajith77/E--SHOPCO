

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    oldPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: null
    },
    discount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    productCategory: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    // ✅ ADD THIS NEW FIELD
    dressStyle: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    rating: {
      type: DataTypes.JSONB,
      defaultValue: { rate: 4.5, count: 0 }
    },
    isNewArrival: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isOnSale: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    brandId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Brands',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true
  });

  return Product;
};