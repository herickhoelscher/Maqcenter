-- Staff login for the admin panel (bcrypt hash only; change the password in Usuarios).
INSERT INTO "User" ("id", "name", "email", "passwordHash", "createdAt")
SELECT '6a8f1d9c388c426cb2f1de9eb2d2c510', 'Administrador', 'admin@maqcentercascavel.com.br', '$2b$12$wXVtlDPCrtw174WODH/1Y.MIxc2Ztmchy6g1vpCQNulgZMhWEqB1G', '2026-10-16T15:14:32.304Z'
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE "email" = 'admin@maqcentercascavel.com.br');
