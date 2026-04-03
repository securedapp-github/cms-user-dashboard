const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Principal = sequelize.define(
    'Principal',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      global_key: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        comment: 'HMAC hex linking email+phone across tenants (see computePrincipalGlobalKey)',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'principals',
      underscored: true,
      timestamps: false,
      indexes: [{ unique: true, fields: ['global_key'] }],
    }
  );
  return Principal;
};
