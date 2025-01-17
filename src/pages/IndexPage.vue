<template>
  <q-page class="row q-pt-xl">
    <div class="full-width q-px-xl">
      <div class="q-mb-xl">
        <q-input lazy-rules :rules="[val => val && val.length > 0 || '不得空白']" v-model="tempData.name" label="姓名" />
        <q-input lazy-rules
          :rules="[val => val[0] !== '0' && Number.isInteger(Number(val)) && Number(val) > 0 && Number(val) < 200 || '不得空白且須為正整數且小於兩百']"
          v-model="tempData.age" label="年齡" />

        <q-btn v-if="isEditing" color="primary" class="q-mt-md q-mr-md" @click="handleUpdate">
          修改
        </q-btn>
        <q-btn v-if="isEditing" color="primary" class="q-mt-md" @click="resetTempData">
          取消修改
        </q-btn>
        <q-btn v-if="!isEditing" color="primary" class="q-mt-md" @click="handleClickCreate">
          新增
        </q-btn>
      </div>

      <q-table flat bordered ref="tableRef" :rows="rowData" :columns="(tableConfig as QTableProps['columns'])"
        row-key="id" hide-pagination separator="cell" :rows-per-page-options="[0]">
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th></q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props" style="min-width: 120px">
              <div>{{ col.value }}</div>
            </q-td>
            <q-td class="text-right" auto-width v-if="tableButtons.length > 0">
              <q-btn @click="handleClickOption(btn, props.row)" v-for="(btn, index) in tableButtons" :key="index"
                size="sm" color="grey-6" round dense :icon="btn.icon" class="q-ml-md" padding="5px 5px">
                <q-tooltip transition-show="scale" transition-hide="scale" anchor="top middle" self="bottom middle"
                  :offset="[10, 10]">
                  {{ btn.label }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data="{ icon }">
          <div class="full-width row flex-center items-center text-primary q-gutter-sm" style="font-size: 18px">
            <q-icon size="2em" :name="icon" />
            <span> 無相關資料 </span>
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { QTableProps, Dialog } from 'quasar';
import * as  Api from 'src/api/base';
import { errorHandler } from 'src/helpers/errorHandler';
import { computed, onBeforeMount, ref } from 'vue';

interface RowData {
  id: string
  name: string,
  age: number
}
interface TableConfig {
  label: string,
  name: string,
  field: string,
  align: string
}
interface TableButton {
  label: string,
  icon: string,
  status: 'edit' | 'delete'
}
interface TempData {
  name: string,
  age: string
}
// const inputError = ref<Record<keyof TempData, boolean>>({
//   name: false,
//   age: false
// })
const rowData = ref<RowData[]>([]);
const tableConfig = ref<TableConfig[]>([
  {
    label: '姓名',
    name: 'name',
    field: 'name',
    align: 'left',
  },
  {
    label: '年齡',
    name: 'age',
    field: 'age',
    align: 'left',
  },
]);
const tableButtons = ref<TableButton[]>([
  {
    label: '編輯',
    icon: 'edit',
    status: 'edit',
  },
  {
    label: '刪除',
    icon: 'delete',
    status: 'delete',
  },
]);
const tempData = ref<TempData>({
  name: '',
  age: '',
});
const isInputDataValid = (data: RowData) => {
  const numAge = Number(data.age)
  const name = data.name
  if (name.length === 0 ||
    !Number.isInteger(numAge) ||
    numAge <= 0 ||
    numAge > 200
  ) {
    return false
  }
  return true
}
const editedId = ref<string | null>(null)
const isEditing = computed(() => {
  return editedId.value !== null
})
const handleClickCreate = async () => {
  const createData = {
    id: '',
    name: tempData.value.name,
    age: Number(tempData.value.age)
  } as RowData
  if (!isInputDataValid(createData)) {
    errorHandler('輸入格式不正確')
    return
  }
  const result = await Api.postApi<TempData, TempData>('', tempData.value)
  if (Api.isFail(result)) {
    errorHandler('新增時發生錯誤')
    return
  }
  resetTempData()
  handleGetRowData()
}
const handleGetRowData = async () => {
  const result = await Api.getApi<RowData[]>('a')
  if (Api.isFail(result)) {
    errorHandler('取得資料時發生錯誤')
    return
  }
  rowData.value = result.data
}
const handleUpdate = async () => {
  const updateData = {
    id: editedId.value,
    name: tempData.value.name,
    age: Number(tempData.value.age)
  } as RowData
  if (!isInputDataValid(updateData)) {
    console.log(updateData, 123123)
    errorHandler('輸入格式不正確')
    return
  }
  const result = await Api.patchApi<RowData, RowData>('', updateData)
  if (Api.isFail(result)) {
    errorHandler('修改失敗')
    return
  }
  handleGetRowData()
  resetTempData()
}
const handleClickUpdateBtn = async (row: RowData) => {
  editedId.value = row.id
  tempData.value.age = String(row.age)
  tempData.value.name = row.name
}
const resetTempData = () => {
  editedId.value = null
  tempData.value.age = ''
  tempData.value.name = ''
}
const handleClickDelete = (row: RowData) => {
  Dialog.create({
    title: '提示',
    message: `確定刪除該筆資料(姓名:${row.name})`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const result = await Api.deleteApi<RowData>(row.id)
    if (Api.isFail(result)) {
      errorHandler('刪除失敗')
      return
    }
    handleGetRowData()
  })
}
const handleClickOption = async (btn: TableButton, row: RowData) => {
  switch (btn.status) {
    case 'delete':
      handleClickDelete(row)
      break;
    case 'edit': {
      handleClickUpdateBtn(row)
      break;
    }
    default:
      errorHandler('handleClickOption default')
      break;
  }
}
onBeforeMount(() => {
  handleGetRowData()
})
</script>

<style lang="scss" scoped>
.q-table th {
  font-size: 20px;
  font-weight: bold;
}

.q-table tbody td {
  font-size: 18px;
}
</style>
