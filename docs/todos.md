- [ ] Документация swagger res, req organization 
- [ ] С помощью них сделать сделать service 
- [ ] решить делать ли store 
- [ ] Улучшить CRUD компоненты и использоватьа под organziation
  Доработай CrudForm — добавь поддержку остальных типов полей
  Добавь индикаторы загрузки мутаций (disabled кнопки, спиннеры)
- [X] Tenant user edit like crete
- [X] Xodim create 
- [X] Xodim update
- [X] После созжании tenat- user редиректит на tenant-users/undefined
- [ ] отображается не данные на tenant-crud 
- [X] присоздание product variant sku, barcode unique мешает даже пустой 
- [ ] product details page add variant
- [ ] product variant tetail page add 
- [ ] qr/barcode scaner 
- [ ] fix create kassa "type"




### Универсальные требования к бэкенду для CRUD-сущности

#### 1. Основной эндпоинт для списка (админка)
**GET** `/[entity]/admin/all`

**Query параметры (все optional):**
- `search` → string (поиск по текстовым полям)
- `sortField` → string (допустимые значения: "name", "email", "phone", "createdAt", "updatedAt", ...)
- `order` → "asc" | "desc" (по умолчанию "desc")
- `page` → number ≥ 1 (по умолчанию 1)
- `limit` → number 1–100 (по умолчанию 10)

**Ответ (обязательная структура):**
```json
{
  "items": [ { ... }, { ... } ],   // массив сущностей
  "total": 124                     // общее количество записей
}
```

#### 2. Создание
**POST** `/[entity]/create`
Body: CreateDto
Ответ:
```json
{ "data": { ...полная сущность... } }
```

#### 3. Обновление
**PATCH** `/[entity]/update/:id`
Body: UpdateDto
Ответ:
```json
{ "data": { ...обновлённая сущность... } }
```

#### 4. Жёсткое удаление
**DELETE** `/[entity]/remove/:id/hard`
Ответ: 204 No Content или `{ "message": "Успешно удалено" }`

#### 5. Получение одной записи (для редактирования, если нужно)
**GET** `/[entity]/admin/:id` или `/[entity]/:id`
Ответ: `{ "data": { ... } }`

#### 6. Сервис (OrganizationService, BrandService и т.д.)
Должен содержать **статические методы**:

```ts
static async getAllAdmin(query: Get[Entity]QueryDto): Promise<{ items: T[]; total: number }>

static async create(dto: CreateDto): Promise<T>

static async update(id: string, dto: UpdateDto): Promise<T>

static async hardDelete(id: string): Promise<void>

static async getByIdAdmin(id: string): Promise<T>   // опционально
```

#### 7. DTO и схемы Zod (обязательно)
- `Create[Entity]Schema` / `Create[Entity]Dto`
- `Update[Entity]Schema` / `Update[Entity]Dto`
- `Get[Entity]QuerySchema` / `Get[Entity]QueryDto` (с валидацией page, limit, sortField, order)

#### 8. Тип сущности
```ts
type Organization = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // ... другие поля
}
```

#### 9. organization.fields.ts (пример для Organization)
Каждое поле должно иметь:
- `name`
- `label`
- `type?`: "text" | "email" | "phone" | "textarea" | "date" | "select" | "number"
- `placeholder?`
- `required?`
- `hiddenInTable?`
- `hiddenInCard?`
- `render?` (для кастомного отображения)
- `options?` (для select)

### Что нужно для каждой новой сущности

Для каждой новой сущности (Brand, Product, Customer, Kassa и т.д.) нужно иметь:

1. DTO + Zod-схемы (Create, Update, GetQuery)
2. Сервис с 4–5 методами (getAllAdmin, create, update, hardDelete, optionally getById)
3. `entity.fields.ts` с массивом `CrudField<Entity>[]`
4. Компонент `EntityCrud.tsx` (аналог OrganizationCrud)

### Следующие шаги

Пожалуйста, скажи мне, **какие сущности** ты хочешь реализовать дальше (например):

- Brand
- Product
- Customer
- Kassa
- Payment
- Sale
- User (внутри организации)
- Settings

Или перечисли их, чтобы я сразу написал:
- структуру DTO + Zod
- методы в сервисе
- пример `entity.fields.ts`
- пример компонента `EntityCrud.tsx`

Какой сущностью займёмся первой?