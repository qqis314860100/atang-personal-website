/**
 * 十大排序算法实现
 */

// 1. 冒泡排序
function bubbleSort(arr) {
  const len = arr.length
  for (let i = 0; i < len - 1; i++) {
    for (let j = 0; j < len - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
      }
    }
  }
  return arr
}

// 2. 选择排序
function selectionSort(arr) {
  const len = arr.length
  for (let i = 0; i < len - 1; i++) {
    let minIndex = i
    for (let j = i + 1; j < len; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j
      }
    }
    if (minIndex !== i) {
      ;[arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
    }
  }
  return arr
}

// 3. 插入排序
function insertionSort(arr) {
  const len = arr.length
  for (let i = 1; i < len; i++) {
    const temp = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > temp) {
      arr[j + 1] = arr[j]
      j--
    }
    arr[j + 1] = temp
  }
  return arr
}

// 4. 希尔排序
function shellSort(arr) {
  const len = arr.length
  let gap = Math.floor(len / 2)

  while (gap > 0) {
    for (let i = gap; i < len; i++) {
      const temp = arr[i]
      let j = i

      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap]
        j -= gap
      }

      arr[j] = temp
    }

    gap = Math.floor(gap / 2)
  }

  return arr
}

// 5. 归并排序
function mergeSort(arr) {
  if (arr.length <= 1) return arr

  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))

  return merge(left, right)
}

function merge(left, right) {
  const result = []
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] < right[rightIndex]) {
      result.push(left[leftIndex])
      leftIndex++
    } else {
      result.push(right[rightIndex])
      rightIndex++
    }
  }

  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex))
}

// 6. 快速排序
function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left < right) {
    const partitionIndex = partition(arr, left, right)
    quickSort(arr, left, partitionIndex - 1)
    quickSort(arr, partitionIndex + 1, right)
  }
  return arr
}

function partition(arr, left, right) {
  const pivot = arr[right]
  let i = left

  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      i++
    }
  }

  ;[arr[i], arr[right]] = [arr[right], arr[i]]
  return i
}

// 7. 堆排序
function heapSort(arr) {
  const len = arr.length

  // 构建最大堆
  for (let i = Math.floor(len / 2) - 1; i >= 0; i--) {
    heapify(arr, len, i)
  }

  // 从堆顶取出元素，调整堆
  for (let i = len - 1; i > 0; i--) {
    ;[arr[0], arr[i]] = [arr[i], arr[0]]
    heapify(arr, i, 0)
  }

  return arr
}

function heapify(arr, len, i) {
  let largest = i
  const left = 2 * i + 1
  const right = 2 * i + 2

  if (left < len && arr[left] > arr[largest]) {
    largest = left
  }

  if (right < len && arr[right] > arr[largest]) {
    largest = right
  }

  if (largest !== i) {
    ;[arr[i], arr[largest]] = [arr[largest], arr[i]]
    heapify(arr, len, largest)
  }
}

// 8. 计数排序
function countingSort(arr) {
  if (arr.length <= 1) return arr

  // 找出最大值和最小值
  let max = arr[0]
  let min = arr[0]

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i]
    if (arr[i] < min) min = arr[i]
  }

  const range = max - min + 1
  const countArray = new Array(range).fill(0)
  const outputArray = new Array(arr.length)

  // 统计元素出现次数
  for (let i = 0; i < arr.length; i++) {
    countArray[arr[i] - min]++
  }

  // 累加统计数组
  for (let i = 1; i < range; i++) {
    countArray[i] += countArray[i - 1]
  }

  // 从后向前遍历原数组，将元素放入输出数组
  for (let i = arr.length - 1; i >= 0; i--) {
    outputArray[countArray[arr[i] - min] - 1] = arr[i]
    countArray[arr[i] - min]--
  }

  return outputArray
}

// 9. 桶排序
function bucketSort(arr, bucketSize = 5) {
  if (arr.length <= 1) return arr

  // 找出最大值和最小值
  let max = arr[0]
  let min = arr[0]

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i]
    if (arr[i] < min) min = arr[i]
  }

  // 计算桶的数量
  const bucketCount = Math.floor((max - min) / bucketSize) + 1
  const buckets = Array.from({ length: bucketCount }, () => [])

  // 将元素分配到桶中
  for (let i = 0; i < arr.length; i++) {
    const bucketIndex = Math.floor((arr[i] - min) / bucketSize)
    buckets[bucketIndex].push(arr[i])
  }

  // 对每个桶进行排序，这里使用插入排序
  const result = []
  for (let i = 0; i < buckets.length; i++) {
    insertionSort(buckets[i])
    result.push(...buckets[i])
  }

  return result
}

// 10. 基数排序
function radixSort(arr) {
  if (arr.length <= 1) return arr

  // 找出最大值，确定最大位数
  let max = Math.abs(arr[0])
  for (let i = 1; i < arr.length; i++) {
    if (Math.abs(arr[i]) > max) max = Math.abs(arr[i])
  }

  // 计算最大位数
  const maxDigits = Math.floor(Math.log10(max)) + 1

  // 处理负数（将数组分为正数和负数部分）
  const positiveArr = arr.filter((num) => num >= 0)
  const negativeArr = arr.filter((num) => num < 0).map((num) => -num)

  // 对正数部分进行基数排序
  let positiveResult = [...positiveArr]
  let negativeResult = [...negativeArr]

  // 基数排序辅助函数
  function radixSortHelper(nums, maxDigits) {
    let mod = 10
    let dev = 1

    for (let i = 0; i < maxDigits; i++, dev *= 10, mod *= 10) {
      const buckets = Array.from({ length: 10 }, () => [])

      for (let j = 0; j < nums.length; j++) {
        const digit = Math.floor((nums[j] % mod) / dev)
        buckets[digit].push(nums[j])
      }

      nums = [].concat(...buckets)
    }

    return nums
  }

  positiveResult = radixSortHelper(positiveResult, maxDigits)
  negativeResult = radixSortHelper(negativeResult, maxDigits)

  // 组合结果：负数部分（倒序）+ 正数部分
  return [...negativeResult.reverse().map((num) => -num), ...positiveResult]
}

// 使用示例
const arr = [64, 34, 25, 12, 22, 11, 90]

console.log('原始数组:', arr)
console.log('冒泡排序:', bubbleSort([...arr]))
console.log('选择排序:', selectionSort([...arr]))
console.log('插入排序:', insertionSort([...arr]))
console.log('希尔排序:', shellSort([...arr]))
console.log('归并排序:', mergeSort([...arr]))
console.log('快速排序:', quickSort([...arr]))
console.log('堆排序:', heapSort([...arr]))
console.log('计数排序:', countingSort([...arr]))
console.log('桶排序:', bucketSort([...arr]))
console.log('基数排序:', radixSort([...arr]))
