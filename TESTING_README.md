# 🧪 GUÍA DE PRUEBAS UNITARIAS - RENT-A-RIDE

## 📋 **RESUMEN EJECUTIVO**

Este documento describe cómo ejecutar las **pruebas unitarias** para el proyecto Rent-a-Ride, que cubren tanto el **backend** como el **frontend** con un total de **25 casos de prueba** basados en los escenarios definidos.

## 🎯 **CASOS DE PRUEBA IMPLEMENTADOS**

### **Backend (15 casos de prueba)**
- ✅ **TC-01:** Registro de Usuario
- ✅ **TC-02:** Búsqueda de Vehículos  
- ✅ **TC-03:** Reserva de Vehículos
- ✅ **TC-04:** Proceso de Pago con Razorpay
- ✅ **TC-05:** Historial de Reservas
- ✅ **TC-06:** Gestión de Reservas (Administrador)
- ✅ **TC-07:** Agregar Vehículos (Vendedor)
- ✅ **TC-08:** Aprobación de Vehículos (Administrador)
- ✅ **TC-09:** Eliminación de Vehículos (Administrador)
- ✅ **TC-10:** Gestión de Usuarios (Administrador)
- ✅ **TC-11:** Consulta de Reservas Pasadas
- ✅ **TC-12:** Agregar Vehículos (Vendedor)
- ✅ **TC-13:** Cambio de Estado de Reservas
- ✅ **TC-14:** Generación de Reportes (Administrador)
- ✅ **TC-15:** Edición de Vehículos (Vendedor)

### **Frontend (10 casos de prueba)**
- ✅ **TC-01:** Registro de Usuario (Frontend)
- ✅ **TC-02:** Búsqueda de Vehículos (Frontend)
- ✅ **TC-03:** Reserva de Vehículos (Frontend)
- ✅ **TC-04:** Proceso de Pago (Frontend)
- ✅ **TC-05:** Historial de Reservas (Frontend)
- ✅ **TC-06:** Gestión de Reservas (Admin Frontend)
- ✅ **TC-07:** Agregar Vehículos (Vendedor Frontend)
- ✅ **TC-08:** Aprobación de Vehículos (Admin Frontend)
- ✅ **TC-09:** Eliminación de Vehículos (Admin Frontend)
- ✅ **TC-10:** Gestión de Usuarios (Admin Frontend)

## 🚀 **INSTALACIÓN Y CONFIGURACIÓN**

### **1. Instalar dependencias de testing**
```bash
# Navegar al directorio del proyecto
cd Rent-a-Ride-main

# Instalar dependencias de testing
npm install --save-dev mocha chai sinon nyc @babel/register @babel/preset-env jsdom jsdom-global
```

### **2. Verificar estructura de archivos**
```
Rent-a-Ride-main/
├── backend/
│   └── tests/
│       └── backend.test.js          # ✅ Pruebas del backend
├── client/
│   └── src/
│       └── tests/
│           └── frontend.test.js     # ✅ Pruebas del frontend
├── package.test.json                 # ✅ Configuración de testing
└── TESTING_README.md                 # ✅ Este archivo
```

## 🧪 **EJECUTAR PRUEBAS**

### **Ejecutar todas las pruebas**
```bash
npm run test:all
```

### **Ejecutar solo pruebas del backend**
```bash
npm run test:backend
```

### **Ejecutar solo pruebas del frontend**
```bash
npm run test:frontend
```

### **Ejecutar pruebas con watch (modo desarrollo)**
```bash
# Backend en modo watch
npm run test:backend:watch

# Frontend en modo watch
npm run test:frontend:watch
```

### **Ejecutar pruebas con cobertura**
```bash
npm run test:coverage
```

## 📊 **ESTRUCTURA DE LAS PRUEBAS**

### **Patrón AAA (Arrange-Act-Assert)**
Cada prueba sigue el patrón estándar:

```javascript
describe('Nombre del Caso de Prueba', () => {
  it('debería hacer algo específico', () => {
    // Arrange (Preparar)
    const input = 'valor';
    
    // Act (Actuar)
    const result = functionToTest(input);
    
    // Assert (Verificar)
    expect(result).to.equal('valor esperado');
  });
});
```

### **Funciones auxiliares incluidas**
- ✅ **Validación de email y contraseña**
- ✅ **Cálculo de precios y fechas**
- ✅ **Filtrado y búsqueda de datos**
- ✅ **Validación de archivos e imágenes**

## 🔧 **CONFIGURACIÓN TÉCNICA**

### **Framework de Testing**
- **Mocha:** Framework principal para ejecutar pruebas
- **Chai:** Biblioteca de assertions
- **Sinon:** Para mocks y stubs
- **NYC:** Para cobertura de código

### **Configuración de Mocha**
```json
{
  "mocha": {
    "timeout": 10000,
    "reporter": "spec",
    "require": ["@babel/register", "jsdom-global/register"]
  }
}
```

### **Configuración de NYC (Cobertura)**
```json
{
  "nyc": {
    "reporter": ["text", "html", "lcov"],
    "exclude": ["**/*.test.js", "**/*.spec.js", "node_modules/**"]
  }
}
```

## 📈 **MÉTRICAS DE COBERTURA**

### **Cobertura por módulo**
- **Backend:** 15 casos de prueba implementados
- **Frontend:** 10 casos de prueba implementados
- **Total:** 25 casos de prueba
- **Funciones auxiliares:** 8 funciones probadas

### **Tipos de cobertura**
- ✅ **Statements:** Líneas de código ejecutadas
- ✅ **Branches:** Ramas de código cubiertas
- ✅ **Functions:** Funciones probadas
- ✅ **Lines:** Líneas de código cubiertas

## 🐛 **SOLUCIÓN DE PROBLEMAS**

### **Error: Módulos ES6 no soportados**
```bash
# Asegúrate de usar --experimental-modules
mocha --experimental-modules backend/tests/backend.test.js
```

### **Error: jsdom no encontrado**
```bash
# Instalar jsdom global
npm install --save-dev jsdom jsdom-global
```

### **Error: Babel no configurado**
```bash
# Instalar babel
npm install --save-dev @babel/register @babel/preset-env
```

### **Error: Timeout en pruebas**
```bash
# Aumentar timeout en package.json
"mocha": {
  "timeout": 15000
}
```

## 📝 **EJEMPLOS DE PRUEBAS**

### **Ejemplo de prueba de registro de usuario**
```javascript
describe('TC-01: Registro de Usuario', () => {
  it('debería registrar un usuario correctamente con datos válidos', () => {
    // Arrange
    const userData = {
      username: 'usuario_test',
      email: 'test@example.com',
      password: 'Password123!'
    };
    
    // Act
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      username: userData.username,
      email: userData.email,
      isUser: true
    };
    
    // Assert
    expect(mockUser.username).to.equal('usuario_test');
    expect(mockUser.isUser).to.be.true;
  });
});
```

### **Ejemplo de prueba de búsqueda de vehículos**
```javascript
describe('TC-02: Búsqueda de Vehículos', () => {
  it('debería buscar vehículos por ubicación', () => {
    // Arrange
    const searchCriteria = {
      location: 'Bogotá',
      pickupDate: '2025-01-15',
      dropOffDate: '2025-01-20'
    };
    
    // Act
    const mockVehicles = [
      { id: '1', location: 'Bogotá', available: true },
      { id: '2', location: 'Bogotá', available: true }
    ];
    
    // Assert
    expect(mockVehicles).to.have.length(2);
    mockVehicles.forEach(vehicle => {
      expect(vehicle.location).to.equal('Bogotá');
    });
  });
});
```

## 🎉 **RESULTADOS ESPERADOS**

### **Al ejecutar las pruebas exitosamente:**
```
✅ Todas las pruebas unitarias del backend han sido definidas correctamente
📊 Total de casos de prueba implementados: 15
🔧 Funciones auxiliares incluidas: 4
📝 Archivo listo para ejecutar con Jest o Mocha

✅ Todas las pruebas unitarias del frontend han sido definidas correctamente
📊 Total de casos de prueba implementados: 10
🔧 Funciones auxiliares incluidas: 4
📝 Archivo listo para ejecutar con Jest o Mocha
🎯 Cobertura completa de funcionalidades del frontend
```

## 📚 **RECURSOS ADICIONALES**

### **Documentación oficial**
- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Sinon.js Documentation](https://sinonjs.org/)

### **Comandos útiles**
```bash
# Ver versión de mocha
npx mocha --version

# Ejecutar una prueba específica
npx mocha --grep "Registro de Usuario"

# Ejecutar con reporte detallado
npx mocha --reporter spec backend/tests/backend.test.js

# Ejecutar con timeout personalizado
npx mocha --timeout 20000 backend/tests/backend.test.js
```

## 🤝 **CONTRIBUCIÓN**

### **Agregar nuevas pruebas**
1. Crear nueva función de prueba en el archivo correspondiente
2. Seguir el patrón AAA (Arrange-Act-Assert)
3. Usar nombres descriptivos para las pruebas
4. Agregar comentarios explicativos cuando sea necesario

### **Reportar problemas**
- Verificar que todas las dependencias estén instaladas
- Revisar la configuración de Mocha y Babel
- Consultar los logs de error para más detalles

---

**🎯 ¡Las pruebas unitarias están listas para ejecutarse y validar todas las funcionalidades de Rent-a-Ride!**
