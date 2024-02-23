<template>
  <div>
    <portal to="page-title">Howdy Buns Links</portal>
    <div class="w-full lg:w-10/12 mx-auto p-2">
      <div v-if="!loading && !error" class="flex flex-col md:flex-row gap-4 justify-center">
        <div class="w-full md:w-7/12">
          <LinksCard
          v-for="(group, index) in groupedLinks"
          :key="index"
          :title="group.title"
          :links="group.links"
          :class="{'mt-6': index > 0}"
          />
          <LinksCard
          :title="rewrittenLinks.title"
          :links="rewrittenLinks.links"
          class="mt-6"
          />
        </div>
        <div class="flex-1">
          <ClientList />
        </div>
      </div>
      <div v-else class="flex justify-center items-center h-screen">
        <span v-if="error" class="text-red-500">Oops, an error occurred. Please try reloading this page</span>
        <span v-else>Loading...</span>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import LinksCard from '@/components/dashboard/LinksCard'
import ClientList from '@/components/dashboard/clients/ClientList'
import airQuery from '@/utils/airtable-query-builder'
import authGuardMixin from '@/mixins/auth-guard'

export default {
  layout: 'dashboard',
  components: {
    ClientList,
    LinksCard
  },
  mixins: [authGuardMixin],
  data () {
    return {
      loading: true,
      error: false
    }
  },
  computed: {
    ...mapGetters({
      pageLinks: 'entities/page-links/links'
    }),
    rewrittenLinks () {
      const rewrittenLinks = {
        title: 'Rewritten Links',
        links: []
      }

      rewrittenLinks.links = this.links.filter(link => !link.external)

      rewrittenLinks.links.push({
        name: 'Client Order Page/Form',
        url: 'clients/recQ3nAfYJ41yUrj5',
        section: 'Rewritten Links',
        external: false
      })

      rewrittenLinks.links.push({
        name: 'Rewards Lookup',
        url: 'rewards/lookup',
        section: 'Rewritten Links',
        external: false
      })

      rewrittenLinks.links.push({
        name: 'Upcoming Orders',
        url: '/orders/upcoming',
        section: 'Rewritten Links',
        external: false
      })

      rewrittenLinks.links.push({
        name: 'Create Order',
        url: '/orders/create',
        section: 'Rewritten Links',
        external: false
      })

      return rewrittenLinks
    },
    links () {
      const links = []
      const excluded = ['previous orders']

      for (let index = 0; index < this.pageLinks.length; index++) {
        const pageLink = this.pageLinks[index]
        const link = {
          name: pageLink.fields.Name,
          section: pageLink.fields.Section,
          url: pageLink.fields.URL,
          external: true
        }

        if (excluded.includes(link.name.toLowerCase())) continue

        if (link.name.toLowerCase() === 'production planner (app)') {
          link.external = false
          link.url = '/production/planner'
        }

        if (link.name.toLowerCase() === 'delivery summary') {
          link.external = false
          link.url = '/delivery/summary'
        }

        if (link.name.toLowerCase() === 'upcoming orders') {
          link.external = false
          link.url = '/orders/upcoming'
        }

        if (link.name.toLowerCase().includes('create order')) {
          link.external = false
          link.url = '/orders/create'
        }

        links.push(link)
      }

      // Additional internal links
      links.push({
        name: 'View Clients',
        section: 'Admin Links',
        url: '/clients',
        external: false
      })

      return links
    },
    groupedLinks () {
      const groups = []

      for (let index = 0; index < this.links.length; index++) {
        const link = this.links[index]

        if (!link.section) {
          continue
        }

        let group = groups.find(g => g.title === link.section)

        if (!group) {
          group = {
            title: link.section,
            links: []
          }

          groups.push(group)
        }

        group.links.push(link)

        const groupIndex = groups.findIndex(g => g.title === link.section)
        groups.splice(groupIndex, 1, group)
      }

      return groups
    }
  },
  async mounted () {
    this.loading = true

    try {
      await this.getPageLinks()
      await this.getClients({
        filterByFormula: airQuery()
          .contains('Client Type', ['bar', 'storefront', 'coffee shop'])
          .get(),
        fields: ['Name', 'Client Type', 'Show on TOC?', 'Active', 'Rec ID']
      })
    } catch (error) {
      console.error(error)
      this.error = true
    }

    this.loading = false
  },
  methods: {
    ...mapActions({
      getPageLinks: 'entities/page-links/get',
      getClients: 'entities/clients/get'
    })
  }
}
</script>
