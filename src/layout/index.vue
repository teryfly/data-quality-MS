<template>
  <div class="app-layout">
    <TopBar />
    <div class="layout-body">
      <Sidebar />
      <div class="layout-main">
        <Breadcrumb />
        <div class="layout-content">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TopBar from './TopBar.vue'
import Sidebar from './Sidebar.vue'
import Breadcrumb from './Breadcrumb.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* Prevent flex child overflow */
}

.layout-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--layout-content-padding);
  background-color: var(--color-bg-gray);
}
</style>
